using System;
using System.Diagnostics;
using System.Net.Http;
using System.Reflection;
using System.Windows;
using System.Windows.Forms;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;

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

            SetStatus(CheckDose3dRunning() ? "running" : "not running");
            AppendLog("Hello, please clicks 'Start' for open Dose3D web interface");
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

        private async void StartButton_Click(object sender, RoutedEventArgs e)
        {
            await Task.Run(RunWsl);
        }

        private async void ShutdownButton_Click(object sender, RoutedEventArgs e)
        {
            await Task.Run(StopWsl);
        }

        protected override void OnStateChanged(EventArgs e)
        {
            if (WindowState == WindowState.Minimized) Hide();

            base.OnStateChanged(e);
        }
        #endregion

        #region WSLManagement

        private string host = "http://localhost:8080/";
        private string wsl = "dose3d";

        static readonly HttpClient client = new HttpClient();
        private Process processWsl;

        private static Process RunConsoleProcessInHiddenWindow(string FileName, string Arguments)
        {
            var startInfo = new ProcessStartInfo
            {
                FileName = FileName,
                Arguments = Arguments,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true,
                StandardOutputEncoding = System.Text.Encoding.Unicode
        };

            var process = new Process();
            process.StartInfo = startInfo;
            process.EnableRaisingEvents = true;
            process.Start();
            return process;
        }

        private static IEnumerable<string> GetLinesFromProcess(Process process)
        {
            string line;
            while ((line = process.StandardOutput.ReadLine()) != null)
            {
                yield return line;
            }
        }

        private bool TryConnectWebApp()
        {
            try
            {
                var response = client.GetAsync(host);
                response.Wait();
                return response.Result.EnsureSuccessStatusCode().IsSuccessStatusCode;
            }
            catch (AggregateException)
            {
                return false;
            }
        }

        private bool CheckWslRunning()
        {
            return GetLinesFromProcess(RunConsoleProcessInHiddenWindow("wsl", "-l --running")).Any(line => line.Trim() == wsl);
        }

        private bool CheckDose3dRunning()
        {
            return CheckWslRunning() && TryConnectWebApp();
        }

        private void ShutdownWsl()
        {
            if (processWsl != null) 
            { 
                processWsl.Close();
                processWsl = null;
            }

            RunConsoleProcessInHiddenWindow("wsl", "--shutdown " + wsl).WaitForExit();
        }

        private void OpenBrowser()
        {
            Process.Start(host);
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

                    AppendLog("... ready, launch browser: " + host);
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
                processWsl = RunConsoleProcessInHiddenWindow("wsl", "-d " + wsl);
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
    }
}
