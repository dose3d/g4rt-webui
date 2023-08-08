using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Dose3dLauncher.WSLChecker
{
    public static class Checkers
    {

        public static string Host
        {
            get => Properties.Settings.Default.host;
            set
            {
                Properties.Settings.Default.host = value;
                Properties.Settings.Default.Save();
            }
        }

        public static string Wsl
        {
            get => Properties.Settings.Default.wsl_name;
            set
            {
                Properties.Settings.Default.wsl_name = value;
                Properties.Settings.Default.Save();
            }
        }

        public static Process RunConsoleProcessInHiddenWindow(string FileName, string Arguments)
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

        public static IEnumerable<string> GetLinesFromProcess(Process process)
        {
            string line;
            while ((line = process.StandardOutput.ReadLine()) != null)
            {
                yield return line;
            }
        }

        public static bool CheckWslInstalled()
        {
            return GetLinesFromProcess(RunConsoleProcessInHiddenWindow("wsl", "--list"))
                .Any(line => line.Trim() == Wsl);
        }

        public static bool CheckWslRunning()
        {
            return Checkers.GetLinesFromProcess(RunConsoleProcessInHiddenWindow("wsl", "-l --running")).Any(line => line.Trim() == Wsl);
        }
    }
}
