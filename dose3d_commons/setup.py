from setuptools import find_packages, setup


setup(
    name='dose3d',
    packages=find_packages(include=['dose3d']),
    version='0.1.0',
    description='Dose3D jobs management library',
    author='Dose3D Team',
    license='MIT',
    install_requires=['psutil'],
)
