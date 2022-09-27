import sys
from argparse import ArgumentParser
import inspect

import torch
import wandb

from dataset import FiberDataModule


def parse_args(raw_args):
    parser = ArgumentParser(description="train a LWBAM-Unet from scratch")
    parser.add_argument("--seed", type=int, default=0)
    parser.add_argument("--epochs", type=int, default=20)
    parser.add_argument("--num_classes", type=int, default=2)
    parser.add_argument("--in_channels", type=int, default=1)
    parser.add_argument("--start_filts", type=int, default=64)
    parser.add_argument("--depth", type=int, default=4)
    parser.add_argument("--batch_size", type=int, default=8)
    parser.add_argument("--learning_rate", type=float, default=0.0001)
    parser.add_argument(
        "--loss", type=str, default="mse_loss"
    )  # torch.nn.functional.mse_loss
    parser.add_argument("--optimizer", type=str, default="adam")  # torch.optim.Adam
    parser.add_argument("--merge_mode", type=str, default="concat")
    parser.add_argument("--up_mode", type=str, default="transpose")
    args = parser.parse_args(raw_args)
    return args


def init_from_valid_args(cls, args):

    params = vars(args)
    valid_kwargs = inspect.signature(cls.__init__).parameters
    cls_kwargs = {name: params[name] for name in valid_kwargs if name in params}

    return cls(**cls_kwargs)


if __name__ == "__main__":

    run = wandb.init(config=parse_args(sys.argv[1:]))
    args = run.config

    torch.manual_seed(args.seed)

    artifact = run.use_artifact(
        "warm-kanelbullar/FiberDiameter/rendered-fibers-medium:v0"
    )

    args.dataset_path = artifact.download()

    fibers = init_from_valid_args(FiberDataModule, args)
