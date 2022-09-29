import torch
import pytorch_lightning as pl
import ignite
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
    ):
        super().__init__()

        self.model = _UNet(
            num_classes, in_channels, depth, start_filts, up_mode, merge_mode
        )

        self.learning_rate = learning_rate
        self.loss = getattr(torch.nn.functional, loss)
        self.optimizer = getattr(torch.optim, optimizer)

    def forward(self, x: torch.Tensor):
        return self.model(x)

    def training_step(
        self: pl.LightningModule, batch: tuple, batch_idx: int
    ) -> torch.Tensor:
        x, y = batch
        outs = self(x)
        loss = self.loss(outs, y)

        self.log(
            "train/loss",
            loss,
            prog_bar=True,
        )

        return loss

    def validation_step(self: pl.LightningModule, batch: tuple, batch_idx: int):
        x, y = batch
        outs = self(x)
        loss = self.loss(outs, y)

        self.log("validation/loss", loss, prog_bar=True)

        return loss

    def configure_optimizers(self: pl.LightningModule) -> torch.optim.Optimizer:
        return self.optimizer(self.parameters(), lr=self.learning_rate)
