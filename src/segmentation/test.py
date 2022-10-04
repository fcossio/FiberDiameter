import sys
from argparse import ArgumentParser

import wandb

import torch
from dataset import FiberDataset

import onnx
import onnxruntime


def parse_args(raw_args):
    parser = ArgumentParser(description="Evaluate a UNet model (onnx).")
    parser.add_argument("--model_version", type=str, default="latest")
    parser.add_argument("--test_size", type=int, default=255)
    args = parser.parse_args(raw_args)
    return args


def to_numpy(tensor):
    return (
        tensor.detach().cpu().numpy() if tensor.requires_grad else tensor.cpu().numpy()
    )


if __name__ == "__main__":

    run = wandb.init(
        project="FiberDiameter",
        job_type="test",
        config=parse_args(sys.argv[1:]),
    )

    cfg = run.config

    artifact = run.use_artifact(
        "warm-kanelbullar/FiberDiameter/rendered-fibers-medium:latest"
    )

    dataset_path = artifact.download()

    model_artifact = run.use_artifact(f"warm-kanelbullar/FiberDiameter/model.onnx:{cfg.model_version}")

    model_path = model_artifact.download()

    fiber_test = FiberDataset(
        "test",
        dataset_path,
        cfg.test_size,
    )

    onnx_model = onnx.load(cfg.model_path)
    onnx.checker.check_model(onnx_model)

    onnx_session = onnxruntime.InferenceSession(cfg.model_path)
    input_name = onnx_session.get_inputs()[0].name
    output_name = onnx_session.get_outputs()[0].name

    loss = []
    for sample in fiber_test:
        x, y = sample
        inference = onnx_session.run([output_name], {input_name: to_numpy(x[None])})
        loss.append(abs(torch.nn.functional.mse_loss(torch.tensor(inference[0][0]), y)))

    run.log({"loss": sum(loss) * 100 / len(loss)})
