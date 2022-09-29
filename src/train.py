import sys

from argparse import ArgumentParser
import inspect

import torch
import wandb
from pytorch_lightning import Trainer, seed_everything

from model import UNet
from dataset import FiberDataModule

import multiprocessing


def parse_args(raw_args):
    parser = ArgumentParser(description="train a LWBAM-Unet from scratch")
    parser.add_argument("--seed", type=int, default=0)
    parser.add_argument("--max_epochs", type=int, default=20)
    parser.add_argument("--num_classes", type=int, default=1)
    parser.add_argument("--in_channels", type=int, default=2)
    parser.add_argument("--start_filts", type=int, default=64)
    parser.add_argument("--depth", type=int, default=4)
    parser.add_argument("--batch_size", type=int, default=8)
    parser.add_argument("--learning_rate", type=float, default=0.0001)
    parser.add_argument(
        "--loss", type=str, default="mse_loss"
    )  # torch.nn.functional.mse_loss
    parser.add_argument("--optimizer", type=str, default="Adam")  # torch.optim.Adam
    parser.add_argument("--merge_mode", type=str, default="concat")
    parser.add_argument("--up_mode", type=str, default="transpose")
    parser.add_argument(
        "--data_dir", type=str, default="artifacts/rendered-fibers-medium:v0"
    )
    parser.add_argument("--num_workers", type=int, default=multiprocessing.cpu_count())
    parser.add_argument("--limit_train_batches", type=float, default=0.1)
    parser.add_argument("--shuffle", type=bool, default=True)
    parser.add_argument("--train_images", type=int, default=2047)
    parser.add_argument("--val_images", type=int, default=255)
    parser.add_argument("--test_images", type=int, default=255)
    args = parser.parse_args(raw_args)
    return args


def init_from_valid_args(cls, args):

    valid_kwargs = inspect.signature(cls.__init__).parameters
    cls_kwargs = {name: args[name] for name in valid_kwargs if name in args}

    return cls(**cls_kwargs)


if __name__ == "__main__":

    run = wandb.init(
        project="FiberDiameter",
        job_type="train",
        config=parse_args(sys.argv[1:]),
    )
    cfg = run.config

    seed_everything(cfg.seed, workers=True)

    artifact = run.use_artifact(
        "warm-kanelbullar/FiberDiameter/rendered-fibers-medium:latest"
    )

    cfg.dataset_path = artifact.download()

    fibers = init_from_valid_args(FiberDataModule, cfg)

    model = init_from_valid_args(UNet, cfg)

    trainer = init_from_valid_args(Trainer, cfg)

    trainer.fit(model, datamodule=fibers)

    torch.save(model.state_dict(), "trained_model.pth")

    trained_model_artifact = wandb.Artifact("model", type="model", metadata=cfg)
    trained_model_artifact.add_file("trained_model.pth")
    run.log_artifact(trained_model_artifact)
    run.finish()
