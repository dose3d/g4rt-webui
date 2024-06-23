from pylinac import WinstonLutz
import os

data_path = '/app/var/dose3d'

def test_wl(filename, bb_size):
  print('Testing Winston-Lutz')
  wl = WinstonLutz.from_zip(f'{data_path}/uploads/{filename}')
  wl.analyze(bb_size_mm=bb_size)
  return wl.results(as_list=True)

def wl_test_pdf(filename, bb_size):
  wl = WinstonLutz.from_zip(f'{data_path}/uploads/{filename}')
  wl.analyze(bb_size_mm=bb_size)
  if not os.path.exists(f'{data_path}/wl-test'):
    os.makedirs(f'{data_path}/wl-test')
  wl.publish_pdf(f'{data_path}/report.pdf')
  return f'{data_path}/report.pdf'