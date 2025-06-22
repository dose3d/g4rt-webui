# geant4-rt Web Interface - Main Repository

This is the **main repository** for the modular web application. It serves as an umbrella project containing three key components, each stored in a separate subdirectory as a Git submodule:

- [`frontend`](https://github.com/dose3d/g4rt-webui-fe) – React-based frontend application
- [`backend`](https://github.com/dose3d/g4rt-webui-be) – Django-based backend service, Configuration for g4rt and jupyter
- [`devops`](https://github.com/dose3d/g4rt-webui-devops) – Docker-based deployment and development environment configuration

## 📥 Cloning the Repository

To clone this repository along with all submodules, run the following command:

```bash
git clone --recurse-submodules git@github.com:dose3d/g4rt-webui.git
```

## 🚀 Running the Application in Desktop Mode

To provide a seamless **desktop application experience**, two platform-specific launcher scripts are included:

- **`run_mac.command`** – for macOS
- **`run_windows.bat`** – for Windows

These scripts start the application in a windowed interface using Docker and Electron.

### ⚙️ Requirements

Before running the scripts, make sure the following dependencies are installed:

- 🐳 **Docker Desktop**
- 🖥️ **X Server** (required for GUI support):
    - **macOS**: [XQuartz](https://www.xquartz.org/)
    - **Linux**: An X11 server (typically already installed)
    - **Windows**: Comes bundled with the Electron container configuration

### ⏳ Installation Time

> 🛠️ **Note:** The first-time installation may take **1–2 hours**, depending on your internet connection and system performance. This includes pulling Docker images and setting up dependencies.

Once everything is ready, just double-click the appropriate script to launch the app.