from pylinac import WinstonLutz
import os
import io, zipfile
import matplotlib.pyplot as plt

DATA_PATH = '/app/var/dose3d/wl-test'

def _perform_analysis(sources_path: str, bb_size: int):
  wl = WinstonLutz.from_zip(f'{DATA_PATH}/uploads/{sources_path}')
  wl.analyze(bb_size_mm=bb_size)
  return wl

def get_text_results(sources_path, bb_size) -> dict[str, str]:
  wl = _perform_analysis(sources_path, bb_size)
  results = wl.results_data(as_dict=True)
  results['bb_shift_vector'] = wl.bb_shift_instructions()
  results['bb_size_mm'] = f'{bb_size}'
  return results

def get_images(sources_path: str, bb_size: int):
  wl = _perform_analysis(sources_path, bb_size)
  in_memory_zip = io.BytesIO()
  with zipfile.ZipFile(in_memory_zip, 'w', zipfile.ZIP_DEFLATED) as zf:
      plot_io = io.BytesIO()
      plt.close()
      plt.figure(figsize=(10, 10))
      wl.plot_location(show=False)
      plt.savefig(plot_io, format='png')
      zf.writestr('location_plot.png', plot_io.getvalue())
      plot_io.close()

      plot_io = io.BytesIO()
      wl.save_summary(plot_io)
      zf.writestr('summary_plot.png', plot_io.getvalue())
      plot_io.close()

  in_memory_zip.seek(0)
  return in_memory_zip

def get_pdf(sources_path: str, bb_size: int) -> str:
  wl = _perform_analysis(sources_path, bb_size)
  path = f'{DATA_PATH}/results'
  if not os.path.exists(path):
    os.makedirs(path)
  wl.publish_pdf(f'{path}/report.pdf')
  return f'{path}/report.pdf'