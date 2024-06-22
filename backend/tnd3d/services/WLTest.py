from pylinac import WinstonLutz
import os

data_path = '/app/var/dose3d'

def test_wl(filename):
  print('Testing Winston-Lutz')
  wl = WinstonLutz.from_zip(f'{data_path}/uploads/{filename}')
  wl.analyze()
  return wl.results(as_list=True)

def wl_test_pdf(filename):
  wl = WinstonLutz.from_zip(f'{data_path}/uploads/{filename}')
  wl.analyze()
  if not os.path.exists(f'{data_path}/wl-test'):
    os.makedirs(f'{data_path}/wl-test')
  wl.publish_pdf(f'{data_path}/report.pdf')
  return f'{data_path}/report.pdf'