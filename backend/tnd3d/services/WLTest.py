from pylinac import WinstonLutz

def test_wl(filename):
  print('Testing Winston-Lutz')
  wl = WinstonLutz.from_zip(f'/app/var/dose3d/uploads/{filename}')
  wl.analyze()
  return wl.results(as_list=True)

def wl_test_pdf(filename):
  wl = WinstonLutz.from_zip(f'/app/var/dose3d/uploads/{filename}')
  wl.analyze()
  wl.publish_pdf('/app/var/dose3d/wl-test/report.pdf')
  return '/app/var/dose3d/wl-test/report.pdf'