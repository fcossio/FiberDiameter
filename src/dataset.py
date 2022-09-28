import io
import os
import json
import numpy as np

import torch
from torch.utils.data import DataLoader
import pytorch_lightning as pl
from torchvision import transforms

from PIL import Image, ImageOps


def get_fibers_dictionary(data_dir: str, stage: str):

    fibers_dict = {}
    idx = 0

    for file in os.listdir(data_dir):
        if file[: len(stage)] == stage and file[-6:] == "params":
            fibers_dict[idx] = file[:-7]
            idx += 1

    return fibers_dict


def load_task(data_dir: str, task_id: str):
    # Load an image
    im = Image.open(os.path.join(data_dir, task_id + ".png"))
    im = np.array(ImageOps.grayscale(im))
    im = im.reshape((1,) + im.shape).astype(np.float32) / 255  # one channel image
    # Load segmentation
    seg: np.ndarray = (
        np.load(os.path.join(data_dir, task_id + "_seg.npz"))["y"]
    ).squeeze()
    return im, seg


def select_point_and_fiber(seg: np.ndarray):
    # Select a random point that is not background, return the mask for the
    # fiber that the point touches.
    mask_all = seg > 0
    possible_points = np.argwhere(mask_all)
    point_index = np.random.randint(0, possible_points.shape[0] - 1)
    point = possible_points[point_index]
    fiber_id = seg[point[0], point[1]]
    mask = seg == fiber_id
    selected_seg = np.zeros_like(seg, dtype=np.float32)
    selected_seg[mask] = 1.0
    return point[0:2], selected_seg


def get_example(data_dir: str, task_id: str) -> tuple:
    """Creates an example for training"""
    im, seg = load_task(data_dir, task_id)
    point, selected_seg = select_point_and_fiber(seg)
    point_channel = np.zeros_like(im, dtype=np.float32)
    point_channel[0, point[0], point[1]] = 1.0
    x = np.concatenate([im, point_channel])
    y = selected_seg
    return x, y


class FiberDataset(torch.utils.data.Dataset):
    def __init__(self, stage: str, fiber_dic: dict, data_dir: str):
        super().__init__()

        self.stage = stage
        self.fiber_dic = fiber_dic
        self.data_dir = data_dir

    def __len__(self):
        return len(self.fiber_dic)

    def __getitem__(self, idx):
        if torch.is_tensor(idx):
            idx = idx.tolist()

        fiber_file = self.fiber_dic[idx]

        x, y = get_example(self.data_dir, fiber_file)

        x = torch.tensor(x)
        y = torch.tensor(y)[None]

        return x, y


class FiberDataModule(pl.LightningDataModule):
    def __init__(self, data_dir: str, batch_size: int = 32, num_workers: int = 12):
        super().__init__()
        self.data_dir = data_dir
        self.batch_size = batch_size
        self.num_workers = num_workers

    def setup(self, stage: str):

        if stage == "fit" or stage is None:
            train_dict = get_fibers_dictionary(self.data_dir, "train")
            val_dict = get_fibers_dictionary(self.data_dir, "val")
            self.fiber_train = FiberDataset(
                "train",
                train_dict,
                self.data_dir,
            )
            self.fiber_val = FiberDataset(
                "val",
                val_dict,
                self.data_dir,
            )

        else:
            test_dict = get_fibers_dictionary(self.data_dir, "test")

            self.fiber_test = FiberDataset(
                "test",
                test_dict,
                self.data_dir,
            )

    def train_dataloader(self: pl.LightningDataModule):
        return DataLoader(
            self.fiber_train, batch_size=self.batch_size, num_workers=self.num_workers
        )

    def val_dataloader(self: pl.LightningDataModule):
        return DataLoader(
            self.fiber_val, batch_size=self.batch_size, num_workers=self.num_workers
        )

    def test_dataloader(self: pl.LightningDataModule):
        return DataLoader(
            self.fiber_test, batch_size=self.batch_size, num_workers=self.num_workers
        )
