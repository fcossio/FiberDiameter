import wandb

import torch
import pytorch_lightning as pl
import torchmetrics
from unet_pytorch.model import UNet as _UNet


class UNet(pl.LightningModule):
    def __init__(
        self,
        num_classes: int,
        in_channels: int,
        depth: int,
        start_filts: int,
        up_mode: str,
        merge_mode: str,
        learning_rate: float,
        loss: str,
        optimizer: str,
        model_path: str,
    ):

        super().__init__()

        self.model_path = model_path

        self.model = _UNet(
            num_classes, in_channels, depth, start_filts, up_mode, merge_mode
        )

        self.learning_rate = learning_rate
        self.train_acc = torchmetrics.classification.BinaryJaccardIndex()
        self.val_acc = torchmetrics.classification.BinaryJaccardIndex()
        self.test_acc = torchmetrics.classification.BinaryJaccardIndex()
        self.loss = getattr(torchmetrics, loss)()
        self.optimizer = getattr(torch.optim, optimizer)

        self.save_hyperparameters()

    def forward(self, x: torch.Tensor):
        return self.model(x)

    def training_step(
        self: pl.LightningModule, batch: tuple, batch_idx: int
    ) -> torch.Tensor:
        x, y = batch
        outs = self(x)
        loss = self.loss(outs, y)
        self.train_acc(outs, y)

        self.log("train/loss", loss, prog_bar=True)
        # pass reult > acc?
        self.log("train/acc", self.train_acc, on_epoch=True)

        return loss

    def validation_step(
        self: pl.LightningModule, batch: tuple, batch_idx: int
    ) -> torch.Tensor:
        x, y = batch
        outs = self(x)
        loss = self.loss(outs, y)
        self.val_acc(outs, y)

        self.log("val/loss_epoch", loss, prog_bar=True)
        self.log("val/acc_epoch", self.val_acc, prog_bar=True)

        return loss

    def test_step(
        self: pl.LightningModule, batch: tuple, batch_idx: int
    ) -> torch.Tensor:

        x, y = batch
        outs = self(x)
        loss = self.loss(outs, y)
        self.test_acc(outs, y)

        self.log("test/loss_epoch", loss, prog_bar=True)
        self.log("test/acc_epoch", self.test_acc, prog_bar=True)

        return loss

    def configure_optimizers(self: pl.LightningModule) -> torch.optim.Optimizer:
        return self.optimizer(self.parameters(), lr=self.learning_rate)

    def validation_epoch_end(self, validation_step_outputs: torch.Tensor):
        torch.onnx.export(
            model=self,
            args=torch.randn(1, 2, 256, 256),
            f=self.model_path,
            export_params=True,
            input_names=["input"],
            output_names=["segmentation"],
            verbose=False,
        )
        wandb.save(self.model_path)

        self.logger.experiment.log(
            {
                "val/loss": wandb.Histogram(validation_step_outputs),
            }
        )

    def test_epoch_end(self, test_step_outputs: torch.Tensor):
        torch.onnx.export(
            model=self,
            args=torch.randn(1, 2, 256, 256),
            f=self.model_path,
            export_params=True,
            input_names=["input"],
            output_names=["segmentation"],
            verbose=False,
        )
        wandb.save(self.model_path)
