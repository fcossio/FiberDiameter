import os

import yaml
import inspect

import torch
from pytorch_lightning import Trainer, seed_everything
from pytorch_lightning.loggers import WandbLogger
import onnx

import wandb

from UNet import UNet
from dataset import FiberDataModule

import multiprocessing

N_WORKERS = multiprocessing.cpu_count()


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


if __name__ == "__main__":

    wandb.login()

    logger = WandbLogger(
        project="FiberDiameter",
        log_model="all",
    )

    config = load_config("config.yml")
    config["num_workers"] = N_WORKERS
    config["logger"] = logger

    seed_everything(config["seed"], workers=True)

    artifact = wandb.use_artifact(
        "warm-kanelbullar/FiberDiameter/rendered-fibers-medium:latest"
    )

    dataset_path = artifact.download()

    config["dataset_path"] = "artifacts/rendered-fibers-medium:v0"

    fibers = init_from_valid_args(FiberDataModule, config)

    model = init_from_valid_args(UNet, config)

    trainer = init_from_valid_args(Trainer, config)

    trainer.fit(model, datamodule=fibers)

    wandb.finish()
