import io
import os
import json

import torch
from torch.utils.data import DataLoader
import pytorch_lightning as pl
from torchvision import transforms

from PIL import Image

# Create dictionary file containing image_id and fiber_id pairs


def get_fibers_dictionry(path, set_type):
    fibers_dict = {}

    idx = 0

    for file in os.listdir(path):

        if file[:4] == set_type and file[-6:] == "params":
            with open(os.path.join(path, file)) as fibers_json:
                fiber = json.load(fibers_json)

                for element in fiber:
                    if len(element) > 1:
                        fiber[element]["name"] = file[:9] + element
                        fibers_dict[idx] = fiber[element]

                        idx += 1

    return fibers_dict


class FiberDataset(torch.utils.data.Dataset):
    def __init__(self, fiber_dic, root_dir, transform=None):
        super().__init__()

        self.fiber_dic = fiber_dic
        self.root_dir = root_dir
        self.transform = transform

    def __len__(self):
        return len(self.fiber_dic)

    def __getitem__(self, idx):
        if torch.is_tensor(idx):
            idx = idx.tolist()

        fiber_name = self.fiber_dic[idx]["name"]
        fiber_diameter = torch.tensor(self.fiber_dic[idx]["d"], dtype=torch.float64)

        image = Image.open(os.path.join(self.root_dir, f"{fiber_name[:8]}.png"))

        if self.transform:
            image = self.transform(image)

        return image, fiber_diameter


class FiberDataModule(pl.LightningDataModule):
    def __init__(self, data_dir: str = "path/to/dir", batch_size: int = 32):
        super().__init__()
        self.data_dir = data_dir
        self.batch_size = batch_size

    def setup(self, stage: str):
        
        train_dict = get_fibers_dictionry(self.data_dir, "train")
        val_dict = get_fibers_dictionry(self.data_dir, "val")
        test_dict = get_fibers_dictionry(self.data_dir, "test")
    
        self.fiber_train = FiberDataset(
            train_dict, self.data_dir, transforms.Compose([transforms.ToTensor()])
        )
        self.fiber_val = FiberDataset(
            val_dict, self.data_dir, transforms.Compose([transforms.ToTensor()])
        )
        self.fiber_test = FiberDataset(
            test_dict, self.data_dir, transforms.Compose([transforms.ToTensor()])
        )

    def train_dataloader(self):
        return DataLoader(self.fiber_train, batch_size=self.batch_size)

    def val_dataloader(self):
        return DataLoader(self.fiber_val, batch_size=self.batch_size)

    def test_dataloader(self):
        return DataLoader(self.fiber_test, batch_size=self.batch_size)

    def teardown(self, stage: str):
        # Used to clean-up when the run is finished
        pass
