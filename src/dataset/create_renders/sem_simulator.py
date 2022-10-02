"""Create many images and log them to wandb"""

import subprocess
from typing import Tuple

import wandb
from tqdm import tqdm

wandb.login()


def gen_table(d):
    """create a table version of the task"""
    for k, v in d.items():
        v.update({"index": k})
        yield v


def get_cmd(task_uid):
    return f'sudo docker run --rm -i -u $(id -u):$(id -g) -e KUBRIC_USE_GPU=true --cpus=\
"64.0" --volume "$(pwd):/kubric" kubruntu_sdf /usr/bin/python3 "sem_worker.py" {task_uid}'


def create_rendered_dataset(sizes: Tuple[int, int, int], **kwargs):
    """Creates a simple dataset and logs it to wandb.

    Args:
        sizes: Sizes of the train val test splits
    """
    with wandb.init(
        project="FiberDiameter", job_type="create-data", mode="disabled"
    ) as run:
        raw_data = wandb.Artifact(
            "rendered-fibers-large",
            type="dataset",
            description="Single straight fibers split into train/val/test",
            metadata={
                "train_val_test": sizes,
            },
        )

        for set_name, set_size in zip(["train", "val", "test"], sizes):
            for i in tqdm(range(596, set_size), desc=set_name):
                task_uid = f"{set_name}{i:04d}"
                cmd = get_cmd(task_uid)
                succeed = 0
                while succeed == 0:
                    try:
                        subprocess.run(cmd, shell=True, check=True)
                        succeed = 1
                    except Exception as e:
                        print(e)
                # # --- load the image to log it to WandB
                # im = Image.open(f'output/{task_uid}.png')
                # seg = np.load(f'output/{task_uid}_seg.npz')['y']

                raw_data.add_file(f"output/{task_uid}.png", name=f"{task_uid}.png")
                raw_data.add_file(
                    f"output/{task_uid}_seg.npz", name=f"{task_uid}_seg.npz"
                )
                raw_data.add_file(f"output/{task_uid}.json", name=f"{task_uid}.json")
        run.log_artifact(raw_data)


if __name__ == "__main__":
    create_rendered_dataset([8192, 512, 512])
