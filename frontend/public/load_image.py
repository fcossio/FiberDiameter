import io
import json
from typing import List, Tuple

import imageio.v3 as iio
import numpy as np
from PIL import Image
from pyodide.ffi import to_js
from pyodide.http import pyfetch
from scipy.optimize import curve_fit

point = Tuple[float, float]
line = Tuple[point, point]
measurements = List[line]


class LineFit:
    def __init__(self, n: int, step_size: float) -> None:
        """Model that fits a line in a binary image and measures diameter of fibers
        :param n: number of measurements to do along the fitted line.
        :param step_size: step size of diameter measurement (in pixels). Can be fraction.
        """
        self.n = n
        self.step_size = step_size

    def get_coordinates(self, im, value_for_mask):
        # I = rgb2gray(I_orig) #we can delete this if we get binary images
        mask = im > value_for_mask
        fiber_coor = np.argwhere(mask)
        x = fiber_coor[:, 1]
        y = fiber_coor[:, 0]
        return x, y

    def func_line(self, x, a, b):
        return a * x + b

    def func_line_inv(self, y, a, b):
        return (y - b) / a

    def get_fited_line_x_y(self, im):
        value_for_mask = (
            int(np.max(im)) + int(np.min(im))
        ) / 2  # Pixels to mask in get_coordinate
        x, y = self.get_coordinates(im, value_for_mask)
        popt, pcov = curve_fit(self.func_line, x, y)
        return x, y, popt, pcov

    def get_fited_line_y_x(self, im):
        value_for_mask = (
            int(np.max(im)) + int(np.min(im))
        ) / 2  # Pixels to mask in get_coordinate
        x, y = self.get_coordinates(im, value_for_mask)
        popt, pcov = curve_fit(self.func_line, y, x)
        return x, y, popt, pcov

    def get_better_fit(self, x, y, popt, popt_inv, pcov, pcov_inv):
        diagonal = np.diagonal(pcov)
        diagonal_inv = np.diagonal(pcov_inv)
        if np.less(diagonal, diagonal_inv).all():
            popt_fit = popt
            x_line = np.arange(0, max(x), 1)
            y_line = []
            for i in x_line:
                a = self.func_line(x_line[i], *popt)
                y_line.append(a)
            y_fit = y_line
            x_fit = x_line
            p1 = [x_fit[0], y_fit[0]]
            p2 = [x_fit[-1], y_fit[-1]]
        elif not np.less(diagonal, diagonal_inv).all():
            popt_fit = [1 / popt_inv[0], (-popt_inv[1]) / popt_inv[0]]
            y_line = np.arange(0, max(y), 1)
            x_line = []
            for i in y_line:
                a = self.func_line(y_line[i], *popt_inv)
                x_line.append(a)
            y_fit = y_line
            x_fit = x_line
            p1 = [x_fit[0], y_fit[0]]
            p2 = [x_fit[-1], y_fit[-1]]
        else:
            print("One of the pcov values is True and the rest are False")
        return popt_fit, x_fit, y_fit, p1, p2

    def get_point(self, t, p1, p2):
        dx = p2[0] - p1[0]
        dy = p2[1] - p1[1]
        p = [(dx * t + p1[0]), (dy * t + p1[1])]
        return p, dx, dy

    def get_normal_vector(self, t, dx, dy, p3):
        n_pos = [-dy, dx]
        mag_pos = np.linalg.norm(n_pos)
        nu_pos = n_pos / mag_pos
        u_pos = [(nu_pos[0] * t + p3[0]), (nu_pos[1] * t + p3[1])]
        return u_pos

    def is_inside(self, im, pos):
        if not (0 <= pos[0] < im.shape[0]):
            return False
        if not (0 <= pos[1] < im.shape[1]):
            return False
        return True

    def get_pixels_half(self, pos_or_neg, im, dx, dy, p3):
        color_threshold = (int(np.max(im)) + int(np.min(im))) / 2
        for ts in range(len(im[0])):
            u = self.get_normal_vector(
                (pos_or_neg * (ts + (self.step_size))), dx, dy, p3
            )
            test_point = round(u[1]), round(u[0])
            if not self.is_inside(im, test_point):
                return None, None
            test = im[test_point[0], test_point[1]] > color_threshold
            if not test:
                pixels = ts - 1
                break
        return pixels, (u[0], u[1])

    def get_calculated_diameter(self, im, p1, p2):
        color_threshold = (int(np.max(im)) + int(np.min(im))) / 2
        diameters = []
        lines = []
        for n in range(1, self.n + 1):
            t = 1 / (self.n + 1)
            p3, dx, dy = self.get_point((t * n), p1, p2)
            test_point = round(p3[1]), round(p3[0])
            if not self.is_inside(im, test_point):
                continue
            true_point = im[test_point[0], test_point[1]] > color_threshold
            print(true_point.shape)
            if not true_point:
                continue
            if true_point:
                radius_p, cp1 = self.get_pixels_half(1, im, dx, dy, p3)
                radius_n, cp2 = self.get_pixels_half(-1, im, dx, dy, p3)
                if (radius_p is not None) and (radius_n is not None):
                    max_val = max(radius_p, radius_n)
                    min_val = min(radius_p, radius_n)
                    equal = abs((max_val - min_val) / (max_val + 1e-5))
                    if equal < 0.1:
                        lines.append((cp1, cp2))
                        diameters.append(radius_p + radius_n)
        calculated_diameter = np.array(diameters).mean()
        return calculated_diameter, lines

    def line_to_arrays(self, line):
        return [line[0][0], line[1][0]], [line[0][1], line[1][1]]

    def predict(self, im: np.ndarray):
        x, y, popt, pcov = self.get_fited_line_x_y(im)
        _, _, popt_inv, pcov_inv = self.get_fited_line_y_x(im)
        popt_fit, x_fit, y_fit, p1, p2 = self.get_better_fit(
            x, y, popt, popt_inv, pcov, pcov_inv
        )
        calculated_diameter, lines = self.get_calculated_diameter(im, p1, p2)
        return calculated_diameter, lines


line_fit = LineFit(30, 0.3)


async def get_image(url):
    "Load image from a url and return the it with a shape of [h, w, 1]"
    print(f"loading image from {url}")
    response = await pyfetch(url, method="GET", cors="no-cors")
    ans = await response.bytes()
    ans = iio.imread(io.BytesIO(ans))
    im = Image.fromarray(ans).convert("L")
    im = im.resize((256,256))
    print("Read image of size", im.size, "with values between", np.min(im), np.max(im))
    return np.array(im).astype(np.float32) / 255


def convert_to_react_measurements_format(diameter, lines):
    ans = []
    for line in lines:
        img_width = 256
        img_height = 256
        ans.append(
            dict(
                startX=line[0][0] / img_width,
                startY=line[0][1] / img_height,
                endX=line[1][0] / img_width,
                endY=line[1][1] / img_height,
            )
        )
    return json.dumps(dict(diameter=diameter, lines=ans))


async def get_lines(img, selection_point: Tuple[float, float], inference_js_func=None):
    """Load the image and use the js inference function to obtain the segmentation.

    :param img: the image to be processed. the output of get_image.
    :param selection_point: the coordinates (x, y) where the pixel should be selected.
    :param inference_js_func: the handle for the js function that runs inference.
    """
    print(f"Entered get_lines correctly with {img.shape} {selection_point}")
    selection = np.zeros_like(img)
    x, y = selection_point
    x = int(256 * x)
    y = int(256 * y)
    print(f"Selected coords in python are {selection_point} that get converted to {x}, {y}")
    selection[y, x] = 1.0
    seg_input = np.stack([img, selection], axis=-1)
    seg_input = seg_input[np.newaxis, :, :, :]
    print("line 207")
    # The ort Tensor requires a flat list and the dimentions
    arr_dim = to_js([int(x) for x in seg_input.shape])
    flat_img_array = to_js(seg_input.flatten().tolist())
    print("line 211")
    # Run the model in WASM with our js func
    data, dims = await inference_js_func(flat_img_array, arr_dim)
    print("line 214")
    ans = np.asarray(data.to_py()).reshape(dims.to_py())[0, :, :, 0]
    print(ans)
    # The array is ready to fit the lines
    measurements = line_fit.predict(ans > 0.5)
    return convert_to_react_measurements_format(*measurements)


{"get_image": get_image, "get_lines": get_lines}
