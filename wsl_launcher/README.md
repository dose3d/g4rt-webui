# Dose3D launcher

The action:

1. Runs WSL with Dose3D
2. Wait for start
3. Launch default browser with Dose3D Web Application

## Config

Open `Dose3dLauncher.exe.config` file and looking for `<setting name="..."`:

* `wsl_name` - the WSL image name
* `host` - URL of Dose3D Web Application when WSL working
