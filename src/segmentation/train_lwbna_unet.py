r"""
python train_lwbam_unet.py --seed=0 --epochs=1 --batch_size=8 \
    --learning_rate=0.0001 --loss='mean_squared_error' --dropout_rate=0.3 \
    --filters=64 --depth=4 --midblock_steps=4
"""
import os
import sys
from argparse import ArgumentParser

import keras
import numpy as np
import pandas as pd
import tensorflow as tf
import wandb
from LWBNA_Unet import LWBNAUnet
from PIL import Image, ImageOps

print(tf.config.list_physical_devices())
assert len(tf.config.list_physical_devices()) == 2
distribution_strategy = tf.distribute.MirroredStrategy()
# mixed_precision.set_global_policy('mixed_float16')


def parse_args(raw_args):
    parser = ArgumentParser(description="train a LWBAM-Unet from scratch")
    parser.add_argument("--seed", type=int, default=0)
    parser.add_argument("--epochs", type=int)
    parser.add_argument("--batch_size", type=int)
    parser.add_argument("--learning_rate", type=float)
    parser.add_argument("--loss", type=str)
    parser.add_argument("--dropout_rate", type=float)
    parser.add_argument("--filters", type=int)
    parser.add_argument("--depth", type=int)
    parser.add_argument("--midblock_steps", type=int)
    args = parser.parse_args(raw_args)
    return args


def load_task(dataset_path, task_id):
    # Load an image
    im = Image.open(os.path.join(dataset_path, task_id + ".png"))
    im = np.array(ImageOps.grayscale(im))
    im = im.reshape(im.shape + (1,)).astype(np.float32) / 255  # one channel image
    # Load segmentation
    seg: np.ndarray = np.load(os.path.join(dataset_path, task_id + "_seg.npz"))["y"]
    return im, seg


def select_point_and_fiber(seg):
    # Select a random point that is not background, return the mask for the
    # fiber that the point touches.
    mask_all = seg > 0
    possible_points = np.argwhere(mask_all)
    point_index = np.random.randint(0, possible_points.shape[0] - 1)
    point = possible_points[point_index]
    fiber_id = seg[point[0], point[1], point[2]]
    mask = seg == fiber_id
    selected_seg = np.zeros_like(seg, dtype=np.float32)
    selected_seg[mask] = 1.0
    return point[0:2], selected_seg


def get_example(dataset_path, task_id):
    """Creates an example for training"""
    im, seg = load_task(dataset_path, task_id)
    point, selected_seg = select_point_and_fiber(seg)
    point_channel = np.zeros_like(im, dtype=np.float32)
    point_channel[point[0], point[1], 0] = 1.0
    x = np.concatenate([im, point_channel], axis=-1)
    y = selected_seg
    return x, y


# generators for model training input
def example_generator(dataset_path, task_list):
    for task_id in task_list:
        yield get_example(dataset_path, task_id)


def batcher(generator, batch_size):
    batch = [], []
    counter = 0
    for x, y in generator:
        batch[0].append(x)
        batch[1].append(y)
        counter += 1
        if counter % batch_size == 0:
            yield batch
            batch = [], []
    if len(batch[0]) > 0:
        yield batch


def train_batch_gen():
    train_tasks = [f"train{i:04d}" for i in range(2048)]
    for x, y in batcher(example_generator(dataset_path, train_tasks), batch_size):
        yield x, y


def val_batch_gen():
    val_tasks = [f"val{i:04d}" for i in range(256)]
    for x, y in batcher(example_generator(dataset_path, val_tasks), batch_size):
        yield x, y


def log_val_table(val_batch_path: str, model: keras.Model):
    test_batch = np.load(val_batch_path)
    pred = model.predict(test_batch["x"])
    print(pred.shape)
    rows = []
    for i, (x, y, ŷ) in enumerate(zip(test_batch["x"], test_batch["y"], pred)):
        im = wandb.Image(
            x[:, :, 0],
            caption=f"val_batch_0_{i}",
            masks={
                "ground_truth": {
                    "mask_data": y[:, :, 0].astype(int),
                    "class_labels": {0: "background", 1: "foreground"},
                },
                "selection": {
                    "mask_data": x[:, :, 1].astype(int),
                    "class_labels": {0: "background", 1: "foreground"},
                },
                "prediction": {
                    "mask_data": (ŷ[:, :, 0] > 0.5).astype(int),
                    "class_labels": {0: "background", 1: "foreground"},
                },
            },
        )
        rows.append({"image": im})
    df = pd.DataFrame(rows)
    table = wandb.Table(dataframe=df)
    wandb.log({"val_batch_0_table": table})


if __name__ == "__main__":
    run = wandb.init(config=parse_args(sys.argv[1:]))
    c = run.config

    artifact = run.use_artifact(
        "warm-kanelbullar/FiberDiameter/rendered-fibers-medium:v0"
    )

    tf.keras.utils.set_random_seed(c.seed)

    dataset_path = artifact.download()
    batch_size = c.batch_size

    train_dataset: tf.data.Dataset = tf.data.Dataset.from_generator(
        train_batch_gen,
        output_signature=(
            tf.TensorSpec(shape=[batch_size, 256, 256, 2], dtype=tf.float32),
            tf.TensorSpec(shape=[batch_size, 256, 256, 1], dtype=tf.float32),
        ),
    ).prefetch(2)

    val_dataset = tf.data.Dataset.from_generator(
        val_batch_gen,
        output_signature=(
            tf.TensorSpec(shape=[batch_size, 256, 256, 2], dtype=tf.float32),
            tf.TensorSpec(shape=[batch_size, 256, 256, 1], dtype=tf.float32),
        ),
    ).prefetch(2)

    adam = tf.keras.optimizers.Adam(learning_rate=c.learning_rate)
    precision = tf.keras.metrics.Precision()
    recall = tf.keras.metrics.Recall()
    iou = tf.keras.metrics.BinaryIoU(target_class_ids=[0, 1], threshold=0.5)
    unet = LWBNAUnet(
        n_classes=1,
        filters=c.filters,
        depth=c.depth,
        midblock_steps=c.midblock_steps,
        dropout_rate=c.dropout_rate,
    )
    unet.compile(
        optimizer=adam,
        loss=c.loss,
        metrics=[precision, recall, iou],
    )
    unet.fit(
        train_dataset,
        validation_data=val_dataset,
        epochs=c.epochs,
        callbacks=[
            wandb.keras.WandbCallback(
                save_model=True,
                save_weights_only=True,
                monitor="val_binary_io_u",
                mode="max",
                generator=val_batch_gen(),
                validation_steps=2,
                predictions=8,
                input_type="segmentation_mask",
                output_type="segmentation_mask",
                log_evaluation=True,
                log_evaluation_frequency=10,
            )
        ],
        verbose=2,
    )

    # val_batch_path = '/home/fer/projects/diameterY/segmentation/val_batch_0.npz'
    # log_val_table(val_batch_path, unet)
