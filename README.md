# FiberDiameter

Measure the diameter of fibers in electron microscopy images, assisted by deep learning
models, directly in your browser.

## Usage

### Online

The app is openly available at [FiberDiameter.com](https://www.fiberdiameter.com)

You can start by playing with the test image. First select the wand tool and then select the fiber that you want to measure.

The deep learning models are run directly in the browser. This means that your images never leave your computer and your intellectual property is preserved.
In the world of machine learning, more data translates to better performance of the models. If you would like to donate images for training models, please get in touch with [YaelSuarez](mailto:yael.suarez@farmaci.uu.se). This will make the models better for you and for everyone.

### Locally

```bash
git clone https://github.com/fcossio/FiberDiameter.git
cd FiberDiameter/frontend/
yarn # install node modules
yarn dev # start the development server
```

## Contributing

Interested in contributing? Check out the [contributing](CONTRIBUTING.md) guidelines.
Please note that this project is released with a Code of Conduct.
By contributing to this project, you agree to abide by its terms.

## License

`FiberDiameter.com` was created by Fernando Cossio, Yael Suarez, Luis Cossio and Ale de Luna.
It is licensed under the terms of the Apache License 2.0 license.

## Our tech stack

We use:
- [kubrik](https://kubric.readthedocs.io/en/latest/) to generate synthetic data.
- Tensorflow and Pytorch for training models (exported to ONNX).
- [Nextjs](https://vercel.com/) for the frontend app.
- [Pyodide](https://pyodide.org/) and [onnxruntime](https://onnxruntime.ai/) for running inference in the browser.
- And [Vercel](https://nextjs.org/) for deployment.

## Aknowledgements

This project started as part of the W&B - Effective MLOps course and it was further
developed during the
[Full Stack Deep Learning](https://fullstackdeeplearning.com/course/2022/) course.
