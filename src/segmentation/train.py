import yaml
import inspect
import numpy as np

import torch
import pytorch_lightning as pl
from pytorch_lightning import Trainer, seed_everything
from pytorch_lightning.loggers import WandbLogger
from PIL import Image as PILImage

import wandb

from UNet import UNet
from dataset import FiberDataModule

import multiprocessing


def load_config(config_file):
    with open(config_file) as file:
        config = yaml.safe_load(file)

    return config


def init_from_valid_args(cls, args):

    valid_kwargs = inspect.signature(cls.__init__).parameters
    cls_kwargs = {name: args[name] for name in valid_kwargs if name in args}

    return cls(**cls_kwargs)


def to_numpy(tensor):
    return (
        tensor.detach().cpu().numpy() if tensor.requires_grad else tensor.cpu().numpy()
    )


class ImagePredictionLogger(pl.Callback):
    def __init__(self, batch, n_samples=3):
        super().__init__()
        self.x, self.y = batch
        self.x = self.x[:n_samples]
        self.y = self.y[:n_samples]

    def on_validation_epoch_end(self, trainer, pl_module):

        x = self.x.to(device=pl_module.device)

        outs = pl_module(x).detach()

        trainer.logger.experiment.log(
            {
                "examples": [
                    wandb.Image(
                        x_i[0, :, :],
                        masks={
                            "ground_truth": {
                                "mask_data": to_image(y_i[0, :, :]),
                                "class_labels": {255: "foreground", 0: "background"},
                            },
                            "prediction": {
                                "mask_data": to_image(out_i[0, :, :] > 0.5),
                                "class_labels": {255: "foreground", 0: "background"},
                            },
                        },
                    )
                    for x_i, out_i, y_i in zip(x, outs, self.y)
                ],
                "global_step": trainer.global_step,
            }
        )


def to_image(tensor: torch.tensor):

    return tensor.numpy().astype(np.int8) * 255


if __name__ == "__main__":

    wandb.login()

    logger = WandbLogger(
        project="FiberDiameter",
        log_model="all",
    )

    config = load_config("config.yml")

    config["logger"] = logger
    config["num_workers"] = multiprocessing.cpu_count()
    if torch.cuda.device_count():
        config["accelerator"] = "gpu"
        config["devices"] = torch.cuda.device_count()

    seed_everything(config["seed"], workers=True)

    artifact = wandb.use_artifact(
        "warm-kanelbullar/FiberDiameter/rendered-fibers-medium:latest"
    )

    dataset_path = artifact.download()

    config["dataset_path"] = "artifacts/rendered-fibers-medium:v0"

    fibers = init_from_valid_args(FiberDataModule, config)

    model = init_from_valid_args(UNet, config)

    fibers.prepare_data()
    fibers.setup()
    samples = next(iter(fibers.val_dataloader()))

    config["callbacks"] = [ImagePredictionLogger(samples)]

    trainer = init_from_valid_args(Trainer, config)

    trainer.fit(model, datamodule=fibers)

    wandb.finish()
