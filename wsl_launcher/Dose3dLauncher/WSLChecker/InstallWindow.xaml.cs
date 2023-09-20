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
using static System.Windows.Forms.LinkLabel;
using Path = System.IO.Path;

namespace Dose3dLauncher.WSLChecker
{
    /// <summary>
    /// Interaction logic for InstallWindow.xaml
    /// </summary>
    public partial class InstallWindow : Window
    {
        private bool DoClosing = false;

        private readonly Task<bool> BackgroundCheckerTask;
        private string VmNameTextBoxValue = "";
        private string VmLocationTextBoxValue = "";
        private bool ForceCheck = false;

        public InstallWindow()
        {
            InitializeComponent();

            VmNameTextBox.Text = VmNameTextBoxValue = Checkers.Wsl;
            VmLocationTextBox.Text = VmLocationTextBoxValue = Checkers.WslLocation;

            BackgroundCheckerTask = Task.Run(() =>
            {
                var oldWslName = "";
                while (!DoClosing)
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
                                ChangeVMName.IsEnabled = false;
                                BackupButton.IsEnabled = true && LongTask == null;
                                RestoreButton.IsEnabled = false;
                                UninstallButton.IsEnabled = true && LongTask == null;
                            }
                            else
                            {
                                ChangeVMName.IsEnabled = true && LongTask == null;
                                BackupButton.IsEnabled = false;
                                RestoreButton.IsEnabled = true && LongTask == null;
                                UninstallButton.IsEnabled = false;
                            }

                            if (LongTask != null)
                            {
                                InstalledTextBlock.Visibility = Visibility.Collapsed;
                                NotInstalledTextBlock.Visibility = Visibility.Collapsed;
                                PendingTextBlock.Visibility = Visibility.Visible;
                            }
                            else
                            {
                                PendingTextBlock.Visibility = Visibility.Collapsed;
                                if (installed)
                                {
                                    InstalledTextBlock.Visibility = Visibility.Visible;
                                    NotInstalledTextBlock.Visibility = Visibility.Collapsed;
                                }
                                else
                                {
                                    InstalledTextBlock.Visibility = Visibility.Collapsed;
                                    NotInstalledTextBlock.Visibility = Visibility.Visible;
                                }
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

        private void ChangeVMName_Click(object sender, RoutedEventArgs e)
        {
            //System.Windows.Input.
            //VmNameTextBoxValue = VmNameTextBox.Text;
            var window = new VMNameWindow()
            {
                VMName = VmNameTextBox.Text,
                Owner = this
            };

            if (window.ShowDialog() == true)
            {
                VmNameTextBox.Text = window.VMName;
                VmNameTextBoxValue = VmNameTextBox.Text;
            }
        }

        private void ChangeVMLocation_Click(object sender, RoutedEventArgs e)
        {
            /*var dialog = new CommonOpenFileDialog();
            dialog.IsFolderPicker = true;
            CommonFileDialogResult result = dialog.ShowDialog();
            if (result == CommonFileDialogResult.Ok)
            {

            }*/
        }


        private void Window_Closed(object sender, EventArgs e)
        {
            DoClosing = true;
            BackgroundCheckerTask.Wait();
        }

        private string GetFileForSaveBackup()
        {
            // Configure open file dialog box
            var dialog = new Microsoft.Win32.SaveFileDialog();
            dialog.FileName = "dose3d_vm_backup_" + DateTime.Now.ToString("yyyyMMdd_HHmm");
            dialog.DefaultExt = ".dose3d";
            dialog.Filter = "Dose3D VM image (*.dose3d)|*.dose3d|All files (*.*)|*.*"; // Filter files by extension

            // Show open file dialog box
            bool? result = dialog.ShowDialog();

            return result == true ? dialog.FileName : null;
        }

        private void MakeBackup()
        {
            string filename = GetFileForSaveBackup();
            if (filename != null)
            {
                DisableForLongTask();
                LongTask = Task.Run((() =>
                {
                    SaveBackup(filename, true);
                    FinishTask();
                }));
            }
        }

        private bool SaveBackup(string filename, bool openExplorer)
        {
            string args = "--export " + Checkers.Wsl + " " + filename;
            AppendLog("Save backup of VM to: " + filename);
            AppendLog("\ncommand:");
            AppendLog("wsl.exe" + args);

            var process = Checkers.RunConsoleProcessInHiddenWindow("wsl.exe", args);
            RunningProcess = process;
            if (process != null)
            {
                string line;
                while ((line = process.StandardOutput.ReadLine()) != null)
                {
                    AppendLog(line);
                }
            }

            process.WaitForExit();
            AppendLog("Finish, exit code: " + process.ExitCode + "\n");

            if (process.ExitCode == 0 && openExplorer)
            {
                ProcessStartInfo startInfo = new ProcessStartInfo
                {
                    Arguments = (new DirectoryInfo(filename)).Parent.FullName,
                    FileName = "explorer.exe"
                };

                Process.Start(startInfo);
            }

            return process.ExitCode == 0;
        }

        private void BackupButton_Click(object sender, RoutedEventArgs e)
        {
            MakeBackup();
        }

        private void RestoreFromBackup()
        {
            string strExeFilePath = System.Reflection.Assembly.GetExecutingAssembly().Location;
            string strWorkPath = Path.GetDirectoryName(strExeFilePath);

            // Configure open file dialog box
            var dialog = new Microsoft.Win32.OpenFileDialog
            {
                InitialDirectory = strWorkPath,
                DefaultExt = ".dose3d",
                Filter = "Dose3D VM image (*.dose3d)|*.dose3d|All files (*.*)|*.*" // Filter files by extension
            };
            //dialog.FileName = "dose3d_vm_backup_" + DateTime.Now.ToString("yyyyMMdd_HHmm");

            // Show open file dialog box
            bool? result = dialog.ShowDialog();
            if (result != true)
            {
                return;
            }

            string filename = dialog.FileName;

            // Configure
            var doseDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Dose3D");

            if (!Directory.Exists(doseDir))
            {
                Directory.CreateDirectory(doseDir);
            }

            //var destDir = Path.Combine(doseDir, Checkers.Wsl + ".img");
            
            var folderDialog = new Microsoft.Win32.SaveFileDialog()
            {
                Title = "Please check destination of VM location",
                InitialDirectory = doseDir,
                Filter = "Virtual Disk (*.vhdx)|*.vhdx|All files (*.*)|*.*",
                DefaultExt = ".vhdx",
                CheckPathExists = true,
                FileName = "g4rt_vm"
            };

            if (folderDialog.ShowDialog() != true) return;
            VmLocationTextBoxValue = VmLocationTextBox.Text = folderDialog.FileName;
            
            // Process open file dialog box results
            RestoreFromFile(filename);
        }

        private void RestoreFromFile(string filename)
        {
            /*var doseDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Dose3D");

            if (!Directory.Exists(doseDir))
            {
                Directory.CreateDirectory(doseDir);
            }*/

            /*var p = new Process
            {
                StartInfo =
                {
                    FileName = "wsl.exe",
                    Arguments = "--import " + Checkers.Wsl + " " + Path.Combine(doseDir, "wsl_image.img") + " " + filename
                }
            };
            p.Start();
            p.WaitForExit();*/

            //var dest = Path.Combine(doseDir, Checkers.Wsl + ".img");
            var dest = VmLocationTextBoxValue;
            var args = "--import " + Checkers.Wsl + " " + dest + " " + filename;

            DisableForLongTask();
            AppendLog("Start installation virtual machine:");
            AppendLog("VM name: " + Checkers.Wsl);
            AppendLog("VM source file: " + filename);
            AppendLog("VM location: " + dest);
            AppendLog("\ncommand:");
            AppendLog("wsl.exe " + args + "\n");

            LongTask = Task.Run(() =>
            {
                ForceCheck = true;
                var process = Checkers.RunConsoleProcessInHiddenWindow("wsl.exe", args);
                RunningProcess = process;
                if (process != null)
                {
                    string line;
                    while ((line = process.StandardOutput.ReadLine()) != null)
                    {
                        AppendLog(line);
                    }
                }

                process.WaitForExit();
                AppendLog("Finish, exit code: " + process.ExitCode + "\n");
                Checkers.WslLocation = VmLocationTextBoxValue;
                FinishTask();
            });
        }

        private void UninstallVM()
        {
            string args = "--unregister " + Checkers.Wsl;
            AppendLog("Uninstall VM: " + Checkers.Wsl);
            AppendLog("\ncommand:\nwsl.exe " + args);
            var process = Checkers.RunConsoleProcessInHiddenWindow("wsl.exe", args);
            if (process != null)
            {
                string line;
                while ((line = process.StandardOutput.ReadLine()) != null)
                {
                    AppendLog(line);
                }
            }

            try
            {
                AppendLog("Delete directory: " + Checkers.WslLocation + "...");
                Directory.Delete(Checkers.WslLocation);
                AppendLog("done");
            }
            catch (Exception ex)
            {
                AppendLog("Warning, can't delete because: " + ex);
            }

            AppendLog("\n");
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
                string filename = GetFileForSaveBackup();
                if (filename != null)
                {
                    DisableForLongTask();
                    LongTask = Task.Run(() =>
                    {
                        ForceCheck = true;
                        if (SaveBackup(filename, false) && !BrokeTask)
                        {
                            UninstallVM();
                        }
                        FinishTask();
                    });
                }
            }
            else if (ret == MessageBoxResult.No)
            {
                DisableForLongTask();
                LongTask = Task.Run(() =>
                {
                    ForceCheck = true;
                    UninstallVM();
                    FinishTask();
                });
            }
        }

        private void BreakButton_Click(object sender, RoutedEventArgs e)
        {
            BreakTask();
        }

        private void RestoreButton_Click(object sender, RoutedEventArgs e)
        {
            RestoreFromBackup();
        }

        private void InstallButton_Click(object sender, RoutedEventArgs e)
        {
            string strExeFilePath = System.Reflection.Assembly.GetExecutingAssembly().Location;
            string strWorkPath = Path.GetDirectoryName(strExeFilePath);
            string img = Path.Combine(strWorkPath, "vm_image.dose3d");
            if (File.Exists(img))
            {
                RestoreFromFile(img);
            }
            else
            {
                MessageBox.Show(this,
                    "File " + img +
                    " not exists. If you remove factory VM image you must reinstall Dose3D again or restore VM from backup.",
                    "Install factory reset of VM", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }
        private void AppendLog(string message)
        {
            Dispatcher.BeginInvoke(new Action(() => { LogTextBox.Text += message + "\n"; }));
        }

        #region LongTask

        private Task LongTask;
        private bool BrokeTask;
        private Process RunningProcess;

        private void BreakTask()
        {
            AppendLog("\nBroken by user\n");
            BrokeTask = true;
            RunningProcess?.Kill();

            LongTask?.Wait();
            //FinishTask();
        }

        private void FinishTask()
        {
            Dispatcher.BeginInvoke( new Action(() =>
            {
                LongTask = null;
                BrokeTask = false;
                RunningProcess = null;
                BreakButton.IsEnabled = false;
                CloseButton.IsEnabled = true;
                ForceCheck = true;
                VmNameTextBox.IsEnabled = true;
            }));
        }

        private void DisableForLongTask()
        {
            BreakButton.IsEnabled = true;
            CloseButton.IsEnabled = false;
            ChangeVMName.IsEnabled = false;
            BackupButton.IsEnabled = false;
            RestoreButton.IsEnabled = false;
            UninstallButton.IsEnabled = false;
            VmNameTextBox.IsEnabled = false;
        }

        #endregion

        private void Window_Closing(object sender, System.ComponentModel.CancelEventArgs e)
        {
            if (LongTask != null)
            {
                e.Cancel = true;
            }
        }
    }
}
