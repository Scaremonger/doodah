import setuptools

with open("README.md", "r") as fh:
    long_description = fh.read()

setuptools.setup(
    name="doodah",
    version="0.0.1",
    author="Si Dunford",
    author_email="dunford.sj@gmail.com",
    description="Web dashboard",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/Scaremonger/doodah",
    packages=setuptools.find_packages(),
    scripts=['doodah/doodah.sh'] ,
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
)
