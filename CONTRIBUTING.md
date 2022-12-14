# Contributing

Contributions are welcome, and they are greatly appreciated! Every little bit
helps, and credit will always be given.

## Types of Contributions

### Report Bugs

If you are reporting a bug, please include:

* Your operating system name and version.
* Any details about your local setup that might be helpful in troubleshooting.
* Detailed steps to reproduce the bug.

### Fix Bugs

Look through the GitHub issues for bugs. Anything tagged with "bug" and "help
wanted" is open to whoever wants to implement it.

### Implement Features

Look through the GitHub issues for features. Anything tagged with "enhancement"
and "help wanted" is open to whoever wants to implement it.

### Write Documentation

You can never have enough documentation! Please feel free to contribute to any
part of the documentation, such as the official docs, docstrings, or even
on the web in blog posts, articles, and such.

### Submit Feedback

If you are proposing a feature:

* Explain in detail how it would work.
* Keep the scope as narrow as possible, to make it easier to implement.
* Remember that this is a volunteer-driven project, and that contributions
  are welcome :)

## Get Started!

### Repo organization

The repo consists of

1. `dataset` Code to generate synthetic images.
2. `segmentation` Code to create and train a segmentation model.
3. `linefit` Code to fit lines on top of the segmentations.
4. `frontend` React app.
5. `ops` Any automation files required to deploy the model and the app that are not gh actions.

Ready to contribute? Here's how to set up `fiberdiameter` for local development.

1. Create a fork and download a copy of `fiberdiameter` locally.
2. Install `fiberdiameter` using `poetry`:

    ```console
    poetry install
    cd frontend
    npm install
    ```

3. Use `git` (or similar) to create a branch for local development and make your changes:

    ```console
    git checkout -b name-of-your-bugfix-or-feature
    ```

4. When you're done making changes, check that your changes conform to any code formatting requirements and pass any tests.

5. Commit your changes and open a pull request.

## Commit Guidelines

This repository uses the [Angular Commiting Guidelines](https://gist.github.com/brianclements/841ea7bffdb01346392c) so that the
Python Semantic Release can add appropriate information to each release.

## Pull Request Guidelines

Before you submit a pull request, check that it meets these guidelines:

1. The pull request should include additional tests if appropriate.
2. If the pull request adds functionality, the docs should be updated.
3. The pull request should work for all currently supported operating systems and versions of Python.

## Code of Conduct

Please note that the `fiberdiameter` project is released with a
Code of Conduct. By contributing to this project you agree to abide by its terms.
