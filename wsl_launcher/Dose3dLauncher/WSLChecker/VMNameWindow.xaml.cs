using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Shapes;

namespace Dose3dLauncher.WSLChecker
{
    /// <summary>
    /// Interaction logic for VMNameWindow.xaml
    /// </summary>
    public partial class VMNameWindow : Window
    {
        public string VMName { get; set; }

        public VMNameWindow()
        {
            InitializeComponent();
        }

        private void Button_Click(object sender, RoutedEventArgs e)
        {
            VMName = TextBox.Text;
            DialogResult = true;
        }

        private void Window_Loaded(object sender, RoutedEventArgs e)
        {
            TextBox.Text = VMName;
        }
    }
}
