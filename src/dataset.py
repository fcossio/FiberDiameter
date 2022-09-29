import io
import os
import json
import numpy as np

import torch
from torch.utils.data import DataLoader
import pytorch_lightning as pl
from torchvision import transforms

from PIL import Image, ImageOps


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
    def __init__(
        self,
        stage: str,
        data_dir: str,
        num_images: int,
    ):
        super().__init__()

        self.stage = stage
        self.data_dir = data_dir
        self.num_images = num_images

    def __len__(self):
        return self.num_images

    def __getitem__(self, idx):

        task_id = self.stage + str(idx).zfill(4)

        x, y = get_example(self.data_dir, task_id)

        x = torch.tensor(x)
        y = torch.tensor(y)[None]

        return x, y


class FiberDataModule(pl.LightningDataModule):
    def __init__(
        self,
        data_dir: str,
        train_images: int,
        val_images: int,
        test_images: int = None,
        batch_size: int = 32,
        num_workers: int = 2,
    ):
        super().__init__()
        self.data_dir = data_dir
        self.batch_size = batch_size
        self.num_workers = num_workers
        self.train_images = train_images
        self.val_images = val_images
        self.test_images = test_images

    def setup(self, stage: str):

        if stage == "fit" or stage is None:
            self.fiber_train = FiberDataset(
                "train",
                self.data_dir,
                self.train_images,
            )
            self.fiber_val = FiberDataset(
                "val",
                self.data_dir,
                self.val_images,
            )

        else:
            self.fiber_test = FiberDataset(
                "test",
                self.data_dir,
                self.test_images,
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
