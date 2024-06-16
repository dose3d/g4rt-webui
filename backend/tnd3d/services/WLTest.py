from pylinac import WinstonLutz

def test_wl(filename):
  print('Testing Winston-Lutz')
  wl = WinstonLutz(f'/app/var/dose3d/uploads/{filename}')
  wl.analyze()
  return wl.bb_shift_instructions()

def wl_test_pdf(filename):
  wl = WinstonLutz(f'/app/var/dose3d/uploads/{filename}')
  wl.publish_pdf('/app/var/dose3d/wl-test/report.pdf')
  return 'ok'