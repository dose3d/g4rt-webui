using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Shapes;
using Dose3dLauncher.Properties;
using Path = System.IO.Path;

namespace Dose3dLauncher.WSLChecker
{
    /// <summary>
    /// Interaction logic for InstallWindow.xaml
    /// </summary>
    public partial class InstallWindow : Window
    {
        private bool Closing = false;

        private readonly Task<bool> BackgroundCheckerTask;
        private string VmNameTextBoxValue = "";
        private bool ForceCheck = false;

        public InstallWindow()
        {
            InitializeComponent();

            VmNameTextBox.Text = VmNameTextBoxValue = Checkers.Wsl;

            BackgroundCheckerTask = Task.Run(() =>
            {
                var oldWslName = "";
                while (!Closing)
                {
                    Thread.Sleep(500);
                    var newWslName = VmNameTextBoxValue;
                    if (newWslName != oldWslName || ForceCheck)
                    {
                        ForceCheck = false;
                        Checkers.Wsl = newWslName;
                        oldWslName = newWslName;
                        var installed = Checkers.CheckWslInstalled();
                        Application.Current.Dispatcher.Invoke(new Action(() =>
                        {
                            if (installed)
                            {
                                InstallButton.IsEnabled = false;
                                BackupButton.IsEnabled = true;
                                RestoreButton.IsEnabled = false;
                                UninstallButton.IsEnabled = true;
                                InstalledTextBlock.Visibility = Visibility.Visible;
                                NotInstalledTextBlock.Visibility = Visibility.Collapsed;
                            }
                            else
                            {
                                InstallButton.IsEnabled = true;
                                BackupButton.IsEnabled = false;
                                RestoreButton.IsEnabled = true;
                                UninstallButton.IsEnabled = false;
                                InstalledTextBlock.Visibility = Visibility.Collapsed;
                                NotInstalledTextBlock.Visibility = Visibility.Visible;
                            }
                        }));

                    }
                }

                return false;
            });
        }

        private void CloseButton_Click(object sender, RoutedEventArgs e)
        {
            Close();
        }

        private void VmNameTextBox_TextChanged(object sender, TextChangedEventArgs e)
        {
            VmNameTextBoxValue = VmNameTextBox.Text;
        }

        private void Window_Closed(object sender, EventArgs e)
        {
            Closing = true;
            BackgroundCheckerTask.Wait();
        }

        private string MakeBackup()
        {
            // Configure open file dialog box
            var dialog = new Microsoft.Win32.SaveFileDialog();
            dialog.FileName = "dose3d_vm_backup_" + DateTime.Now.ToString("yyyyMMdd_HHmm");
            dialog.DefaultExt = ".dose3d";
            dialog.Filter = "Dose3D VM image (*.dose3d)|*.dose3d|All files (*.*)|*.*"; // Filter files by extension

            // Show open file dialog box
            bool? result = dialog.ShowDialog();

            // Process open file dialog box results
            if (result == true)
            {
                string filename = dialog.FileName;
                var p = new Process
                {
                    StartInfo =
                    {
                        FileName = "wsl.exe",
                        Arguments = "--export " + Checkers.Wsl + " " + filename
                    }
                };
                p.Start();
                p.WaitForExit();
                if (p.ExitCode == 0)
                {
                    return filename;
                }
            }

            return null;
        }

        private void BackupButton_Click(object sender, RoutedEventArgs e)
        {
            var filename = MakeBackup();
            ProcessStartInfo startInfo = new ProcessStartInfo
            {
                Arguments = (new DirectoryInfo(filename)).Parent.FullName,
                FileName = "explorer.exe"
            };

            Process.Start(startInfo);
        }

        private string RestoreFromBackup()
        {
            // Configure open file dialog box
            var dialog = new Microsoft.Win32.OpenFileDialog();
            dialog.FileName = "dose3d_vm_backup_" + DateTime.Now.ToString("yyyyMMdd_HHmm");
            dialog.DefaultExt = ".dose3d";
            dialog.Filter = "Dose3D VM image (*.dose3d)|*.dose3d|All files (*.*)|*.*"; // Filter files by extension

            // Show open file dialog box
            bool? result = dialog.ShowDialog();
            string filename = dialog.FileName;

            // Process open file dialog box results
            if (result == true)
            {
                return RestoreFromFile(filename);
            }

            return null;
        }

        private string RestoreFromFile(string filename)
        {
            var doseDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Dose3D");

            if (!Directory.Exists(doseDir))
            {
                Directory.CreateDirectory(doseDir);
            }

            var p = new Process
            {
                StartInfo =
                {
                    FileName = "wsl.exe",
                    Arguments = "--import " + Checkers.Wsl + " " + Path.Combine(doseDir, "wsl_image.img") + " " + filename
                }
            };
            p.Start();
            p.WaitForExit();
            if (p.ExitCode == 0)
            {
                return filename;
            }
            return null;
        }


        private void UninstallButton_Click(object sender, RoutedEventArgs e)
        {
            var ret = MessageBox.Show(this,
                "You will lost all Dose3D simulations and workspaces. Make backup before remove?",
                "Remove VM", MessageBoxButton.YesNoCancel, MessageBoxImage.Warning, MessageBoxResult.Yes);
            if (ret == MessageBoxResult.Cancel)
            {
                return;
            }
            else if (ret == MessageBoxResult.Yes)
            {
                if (MakeBackup() != null)
                {
                    Checkers.RunConsoleProcessInHiddenWindow("wsl", "--unregister " + Checkers.Wsl);
                }

                ForceCheck = true;
            }
            else
            {
                Checkers.RunConsoleProcessInHiddenWindow("wsl", "--unregister " + Checkers.Wsl);
                ForceCheck = true;
            }
        }

        private void RestoreButton_Click(object sender, RoutedEventArgs e)
        {
            if (RestoreFromBackup() != null)
            {
                ForceCheck = true;
            }
        }

        private void InstallButton_Click(object sender, RoutedEventArgs e)
        {
            string strExeFilePath = System.Reflection.Assembly.GetExecutingAssembly().Location;
            string strWorkPath = Path.GetDirectoryName(strExeFilePath);
            string img = Path.Combine(strWorkPath, "vm_image.dose3d");
            if (File.Exists(img))
            {
                RestoreFromFile(img);
                ForceCheck = true;
            }
            else
            {
                MessageBox.Show(this,
                    "File " + img +
                    " not exists. If you remove factory VM image you must reinstall Dose3D again or restore VM from backup.",
                    "Install factory reset of VM", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }
    }
}
