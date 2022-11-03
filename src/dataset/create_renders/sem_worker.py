r"""This module is intended to run with the following command:

docker run --rm -i -u $(id -u):$(id -g) --volume "$(pwd):/kubric" \
kubruntu_sdf /usr/bin/python3 'create/sem_worker.py' <task_id>

It creates a single scene and stores 3 files. An rgba, a segmentation with
the first 10 fibers and a json with the information about those 10 fibers.
"""
import json
import logging
import os
import shutil
import sys
from itertools import combinations
from random import choice

import kubric as kb
import numpy as np
from kubric.core.color import Color
from kubric.core.materials import PrincipledBSDFMaterial
from kubric.renderer.blender import Blender as KubricRenderer
from sdf import capped_cylinder

logging.basicConfig(level="WARNING", filename="output/output.log")
scene_uid = sys.argv[1]
temp_folder = os.path.join("temp", scene_uid)
os.makedirs(temp_folder, exist_ok=True)


def create_fiber(asset_id, p1, p2, diameter=0.1):
    filepath = os.path.join(temp_folder, f"{asset_id}.obj")
    f = capped_cylinder(p1, p2, diameter / 2)
    # f = f.bend_linear(-Y, 1.5*Y, X/2, ease.in_out_quad)
    f.save(filepath, sparse=True, samples=2**22, verbose=False)
    obj = kb.FileBasedObject(
        asset_id=str(asset_id),
        render_filename=filepath,
        bounds=((-1, -1, -1), (1, 1, 1)),
        simulation_filename=None,
        segmentation_id=asset_id,
    )
    return obj


def rectangle_perimeter(p1, p2, t):
    """t is in range [0,1]
    points are here:
    ---2
    |  |
    1---
    """
    p1 = np.array(p1)
    p2 = np.array(p2)
    d = p2 - p1

    if 0 <= t < 0.25:
        return np.array([4 * t * d[0] + p1[0], p1[1]])
    elif 0.25 <= t < 0.5:
        return np.array([p2[0], 4 * (t - 0.25) * d[1] + p1[1]])
    elif 0.5 <= t < 0.75:
        return np.array([p2[0] - 4 * (t - 0.5) * d[0], p2[1]])
    elif 0.75 <= t <= 1:
        return np.array([p1[0], p2[1] - 4 * (t - 0.75) * d[1]])


def random_line_in_perimeter(p1, p2):
    sides = [[0.00, 0.25], [0.25, 0.50], [0.50, 0.75], [0.75, 1.00]]
    comb = [x for x in combinations(sides, 2)]
    s1, s2 = choice(comb)
    t1 = np.random.uniform(*s1)
    t2 = np.random.uniform(*s2)
    return rectangle_perimeter(p1, p2, t1), rectangle_perimeter(p1, p2, t2)


def random_fiber(asset_id, z, d):
    p1, p2 = random_line_in_perimeter([-0.6, -0.6], [0.6, 0.6])
    p1 = [*p1, z]
    p2 = [*p2, z]
    return create_fiber(asset_id, p1, p2, d), p1, p2


# bg_color
c = np.random.rand()
color_bg = Color(c, c, c, 0.5)
bg_material = PrincipledBSDFMaterial(color=color_bg)

# --- create scene and attach a renderer to it
scene = kb.Scene(resolution=(1024, 1024), background=Color(c, c, c, 1))
renderer = KubricRenderer(
    scene,
    use_denoising=False,
)

c = np.random.rand()
color_fg = Color(c, c, c, 1)
fg_material = PrincipledBSDFMaterial(color=color_fg, roughness=np.random.rand())

# --- populate the scene with bg, lights, and cameras
# bg is id 0
# floor is id 1
scene += kb.Cube(
    name="floor",
    scale=(10, 10, 0.1),
    position=(0, 0, -1),
    material=bg_material,
    background=True,
    segmentation_id=0,
)
scene += kb.DirectionalLight(
    name="sun",
    position=np.random.rand(3) * 3,
    look_at=(0, 0, 0),
    intensity=np.random.uniform(1.0, 2.0),
)
scene.camera = kb.OrthographicCamera(position=(0, 0, 3), orthographic_scale=1)

# --- create random diameters for fibers
mu = np.random.uniform(0.03, 0.15)
d = np.random.normal(mu, 0.01, 50)

# --- create random material for fibers
fg_material = PrincipledBSDFMaterial(
    color=color_fg,
    metallic=np.random.rand(),
    specular=np.random.rand(),
    specular_tint=np.random.rand(),
    roughness=np.random.rand(),
)

# --- initial z position
last_z = 0.1

# --- debug
for asset in scene.foreground_assets:
    print(asset.segmentation_id)

# --- add the first 10 fibers
task_data = {0: {"name": "bg"}}
for i in range(40):

    last_z -= d[i] * 0.5
    if last_z <= -0.8:
        break

    asset_id = i + 100
    obj, p1, p2 = random_fiber(asset_id, last_z, d[i])
    obj.material = fg_material
    scene += obj
    task_data[asset_id] = {
        "name": f"fiber{i:02d}",
        "d": d[i],
        "p1": p1,
        "p2": p2,
    }  # the id of the background is 0, so fibers only go from 1 onwards

frame = renderer.render_still(return_layers=["rgba", "segmentation"])
frame["segmentation"] = kb.adjust_segmentation_idxs(
    frame["segmentation"], scene.assets, scene.assets
).astype(np.uint8)

# --- debug
last_fiber = max(task_data.keys())
max_seg_id = np.max(frame["segmentation"])
assert last_fiber == max_seg_id, f"last_fiber {last_fiber}, max_seg_id {max_seg_id}"
# /--- debug

kb.write_png(frame["rgba"], f"output/{scene_uid}.png")
kb.write_palette_png(frame["segmentation"], f"output/{scene_uid}_seg.png")
np.savez(f"output/{scene_uid}_seg.npz", y=frame["segmentation"])
with open(f"output/{scene_uid}.json", "w") as file:
    json.dump(task_data, file)

# --- save the output as pngs

shutil.rmtree(temp_folder)
