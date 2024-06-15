from pylinac import WinstonLutz

def test_wl():
  wl = WinstonLutz('/app/var/dose3d/uploads')
  wl.analyze()
  wl.publish_pdf('/app/var/dose3d/wl-test/report.pdf')
  return wl.bb_shift_instructions()