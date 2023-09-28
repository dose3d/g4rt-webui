using System;
using System.Diagnostics;
using System.Net.Http;
using System.Reflection;
using System.Windows;
using System.Windows.Forms;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Management;
using Dose3dLauncher.WSLChecker;

namespace Dose3dLauncher
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        #region NotifyIcon
        private NotifyIcon notifyIcon;
        private ContextMenu contextMenu;
        private MenuItem openMenuItem;
        private MenuItem shutdownMenuItem;
        private System.ComponentModel.IContainer components;

        private void InitNotifyIcon()
        {
            components = new System.ComponentModel.Container();
            contextMenu = new ContextMenu();
            openMenuItem = new MenuItem();
            shutdownMenuItem = new MenuItem();

            // Initialize contextMenu1
            contextMenu.MenuItems.AddRange(new MenuItem[] { openMenuItem, shutdownMenuItem });

            // Initialize openMenuItem
            openMenuItem.Index = 0;
            openMenuItem.Text = Properties.Resources.openMenuItem;
            openMenuItem.Click += new EventHandler(openMenu_Click);

            // Initialize shutdownMenuItem
            shutdownMenuItem.Index = 1;
            shutdownMenuItem.Text = Properties.Resources.shutdownMenuItem;
            shutdownMenuItem.Click += new EventHandler(shutdownMenu_Click);

            // Create the NotifyIcon.
            notifyIcon = new NotifyIcon(components);

            // The Icon property sets the icon that will appear
            // in the systray for this application.
            notifyIcon.Icon = System.Drawing.Icon.ExtractAssociatedIcon(Assembly.GetEntryAssembly().ManifestModule.Name);

            // The ContextMenu property sets the menu that will
            // appear when the systray icon is right clicked.
            notifyIcon.ContextMenu = contextMenu;

            // The Text property sets the text that will be displayed,
            // in a tooltip, when the mouse hovers over the systray icon.
            notifyIcon.Text = Properties.Resources.notifyIconLabel;
            notifyIcon.Visible = true;

            // Handle the DoubleClick event to activate the form.
            //notifyIcon.Click += new EventHandler(notifyIcon_Click);
            notifyIcon.DoubleClick += new EventHandler(notifyIcon_Click);

            RunStatusTask();
        }

        private void Window_Loaded(object sender, RoutedEventArgs e)
        {
            SetStatus(CheckDose3dRunning() ? "running" : "not running");

            if (!Checkers.CheckWslInstalled())
            {
                RunConfigWindow();
            }
            else
            {
                UpdateButtonsEnabled();
                AppendLog("Hello, please clicks 'Open Dose3D' for open Dose3D web interface");
            }
        }

        private void RunConfigWindow()
        {
            var iw = new InstallWindow();
            iw.Owner = this;
            iw.ShowDialog();

            if (!Checkers.CheckWslInstalled())
            {
                AppendLog("Dose3D virtual machine is not installed. Please clicks 'Configure' button and install.");
                StartButton.IsEnabled = false;
                ShutdownButton.IsEnabled = false;
            }
            else
            {
                UpdateButtonsEnabled();
            }
        }

        private void UpdateButtonsEnabled()
        {
            ShutdownButton.IsEnabled = Checkers.CheckWslRunning();
        }

        private async void notifyIcon_Click(object Sender, EventArgs e)
        {
            await Task.Run(RunWsl);
        }

        private void notifyIcon_DoubleClick(object Sender, EventArgs e)
        {
            if (WindowState == WindowState.Minimized)
            {
                Show();
                WindowState = WindowState.Normal;
            }

            // Activate the form.
            Activate();
        }

        private void openMenu_Click(object Sender, EventArgs e)
        {
            notifyIcon_DoubleClick(Sender, e);
        }

        private async void shutdownMenu_Click(object Sender, EventArgs e)
        {
            await Task.Run(StopWsl);
            Close();
        }
        #endregion

        #region UI

        public MainWindow()
        {
            InitializeComponent();
            InitNotifyIcon();
        }

        private void AppendLog(string message)
        {
            Dispatcher.Invoke(() => { LogTextBox.Text += message + "\n"; });
        }

        private void SetStatus(string status)
        {
            Dispatcher.Invoke(() =>
            {
                Title = Properties.Resources.notifyIconLabel + " - " + status;
                notifyIcon.Text = Title;
            });
        }

        private void AboutButton_Click(object sender, RoutedEventArgs e)
        {

        }

        private async void StartButton_Click(object sender, RoutedEventArgs e)
        {
            await Task.Run(RunWsl);
        }

        private async void ShutdownButton_Click(object sender, RoutedEventArgs e)
        {
            await Task.Run(StopWsl);
        }

        private void ConfigureButton_Click(object sender, RoutedEventArgs e)
        {
            RunConfigWindow();
        }

        protected override void OnStateChanged(EventArgs e)
        {
            if (WindowState == WindowState.Minimized) Hide();

            base.OnStateChanged(e);
        }
        #endregion

        #region WSLManagement

        static readonly HttpClient client = new HttpClient();
        private Process processWsl;


        private bool TryConnectWebApp()
        {
            try
            {
                var response = client.GetAsync(Checkers.Host);
                response.Wait();
                return response.Result.EnsureSuccessStatusCode().IsSuccessStatusCode;
            }
            catch (AggregateException)
            {
                return false;
            }
        }

        private bool CheckDose3dRunning()
        {
            return Checkers.CheckWslRunning() && TryConnectWebApp();
        }

        private void ShutdownWsl()
        {
            if (processWsl != null) 
            { 
                processWsl.Close();
                processWsl = null;
            }

            Checkers.RunConsoleProcessInHiddenWindow("wsl", "--shutdown " + Checkers.Wsl).WaitForExit();
        }

        private void OpenBrowser()
        {
            try
            {
                // try to find msedge.exe in: C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe
                string programFilesPath = Environment.ExpandEnvironmentVariables("%ProgramFiles(x86)%");
                string msedge = programFilesPath + "\\Microsoft\\Edge\\Application\\msedge.exe";
                if (!File.Exists(msedge))
                {
                    programFilesPath = Environment.ExpandEnvironmentVariables("%ProgramFiles%");
                    msedge = programFilesPath + "\\Microsoft\\Edge\\Application\\msedge.exe";
                }
                Process.Start(msedge, "--app=" + Checkers.Host);
            }
            catch (Exception e) 
            {
                // old working version
                Process.Start(Checkers.Host);
            }
        }

        private Task WaitingForBackendReady()
        {
            return Task.Run(() =>
            {
                while (true)
                {
                    AppendLog("... waiting for ready ...");

                    Thread.Sleep(1000);

                    /*if (!CheckWslRunning())
                    {
                        AppendLog("... WSL not running");
                        return;
                    }*/

                    if (!TryConnectWebApp()) continue;

                    AppendLog("... ready, launch browser: " + Checkers.Host);
                    return;
                }
            });
        }

        private async void RunWsl()
        {
            try
            {
                /*AppendLog("Check WSL status...");

                if (CheckDose3dRunning())
                {
                    AppendLog("... its running, launch browser to: " + host);
                    OpenBrowser();
                    return;
                }

                // confirm the WSL is not running
                ShutdownWsl();*/

                AppendLog("Start WSL...");
                processWsl = Checkers.RunConsoleProcessInHiddenWindow("wsl", "-d " + Checkers.Wsl);
                AppendLog("... starting ...");

                await WaitingForBackendReady();

                SetStatus("running");
                OpenBrowser();

                Dispatcher.Invoke(() => { WindowState = WindowState.Minimized; });
            }
            catch (Exception ex)
            {
                AppendLog("... error: " + ex);
            }
        }

        private void StopWsl()
        {
            try
            {
                ShutdownWsl();
                SetStatus("not running");
                AppendLog("... shutdown");
            }
            catch (Exception ex)
            {
                AppendLog("... error: " + ex);
            }
        }
        #endregion

        #region Status

        private bool closing = false;
        private Task _statusTask;

        private void RunStatusTask()
        {
            _statusTask = Task.Run(() =>
            {
                int counter = 0;
                while (!closing)
                {
                    Thread.Sleep(100);
                    counter++;
                    if (counter > 30)
                    {
                        counter = 0;
                        bool running = Checkers.CheckWslRunning();
                        Dispatcher.Invoke(() =>
                        {
                            if (running)
                            {
                                ShutdownButton.IsEnabled = true;
                            }
                            else
                            {
                                ShutdownButton.IsEnabled = false;
                            }
                        });
                    }
                }
            });
        }

        private void CloseBackgroundTasks()
        {
            closing = true;
            if (_statusTask != null)
            {
                _statusTask.Wait();
            }
        }

        #endregion

        private void Window_Closed(object sender, EventArgs e)
        {
            CloseBackgroundTasks();
        }
    }
}
