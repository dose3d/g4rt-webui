export interface TextResults {
  num_total_images: string;
  bb_size_mm: string;
  bb_shift_vector: string;
  num_gantry_images: string;
  num_gantry_coll_images: string;
  num_coll_images: string;
  num_couch_images: string;
  max_2d_cax_to_bb_mm: string;
  median_2d_cax_to_bb_mm: string;
  mean_2d_cax_to_bb_mm: string;
  max_2d_cax_to_epid_mm: string;
  median_2d_cax_to_epid_mm: string;
  mean_2d_cax_to_epid_mm: string;
  gantry_3d_iso_diameter_mm: string;
  max_gantry_rms_deviation_mm: string;
  max_coll_rms_deviation_mm: string;
  max_couch_rms_deviation_mm: string;
  max_epid_rms_deviation_mm: string;
  gantry_coll_3d_iso_diameter_mm: string;
  coll_2d_iso_diameter_mm: string;
  couch_2d_iso_diameter_mm: string;
}

export type Plots = { filename: string; description: string; url: string | undefined }[];

export const TEXT_RESULTS = [
  { title: 'Number of total images', description: 'The total number of images analyzed.', key: 'num_total_images' },
  { title: 'Size of BB [mm]', description: 'Size of BB.', key: 'bb_size_mm' },
  {
    title: 'Shift instructions',
    description: 'The cartesian vector that would move the BB to the radiation isocenter. Each value is in mm.',
    key: 'bb_shift_vector',
  },
  {
    title: 'Number of gantry images',
    description: 'The number of images that were taken at different gantry angles and all other axes were 0.',
    key: 'num_gantry_images',
  },
  {
    title: 'Number of gantry collimator images',
    description: 'The number of images that were taken at different gantry and collimator angles and the couch was 0.',
    key: 'num_gantry_coll_images',
  },
  {
    title: 'Number of collimator images',
    description: 'The number of images that were taken at different collimator angles and all other axes were 0.',
    key: 'num_coll_images',
  },
  {
    title: 'Number of couch images',
    description: 'The number of images that were taken at different couch angles and all other axes were 0.',
    key: 'num_couch_images',
  },
  {
    title: 'Maximum 2d CAX->BB distance',
    description: 'The maximum 2D distance from the field CAX to the BB across all images analyzed in mm.',
    key: 'max_2d_cax_to_bb_mm',
  },
  {
    title: 'Median 2d CAX->BB distance',
    description: 'The median 2D distance from the field CAX to the BB across all images analyzed in mm.',
    key: 'median_2d_cax_to_bb_mm',
  },
  {
    title: 'Mean 2d CAX->BB distance',
    description: 'The mean 2D distance from the field CAX to the BB across all images analyzed in mm.',
    key: 'mean_2d_cax_to_bb_mm',
  },
  {
    title: 'Maximum 2D CAX->EPID distance',
    description: 'The maximum 2D distance from the field CAX to the EPID center across all images analyzed in mm.',
    key: 'max_2d_cax_to_epid_mm',
  },
  {
    title: 'Median 2D CAX->EPID distance',
    description: 'The median 2D distance from the field CAX to the EPID center across all images analyzed in mm.',
    key: 'median_2d_cax_to_epid_mm',
  },
  {
    title: 'Mean 2D CAX->EPID distance',
    description: 'The mean 2D distance from the field CAX to the EPID center across all images analyzed in mm.',
    key: 'mean_2d_cax_to_epid_mm',
  },
  {
    title: 'Gantry 3D isocenter diameter',
    description:
      'The 3D isocenter diameter of the gantry axis only as determined by the gantry images in mm. This uses backprojection lines of the field center to the source and minimizes a sphere that touches all the backprojection lines.',
    key: 'gantry_3d_iso_diameter_mm',
  },
  {
    title: 'Maximum Gantry RMS deviation [mm]',
    description:
      'The maximum RMS value of the field CAX to BB for the gantry axis images in mm. This is an alternative to the max/mean/median calculations.',
    key: 'max_gantry_rms_deviation_mm',
  },
  {
    title: 'Maximum Collimator RMS deviation [mm]',
    description:
      'The maximum RMS deviation of the field CAX to BB for the collimator axis images in mm. This is an alternative to the max/mean/median calculations.',
    key: 'max_coll_rms_deviation_mm',
  },
  {
    title: 'Maximum Couch RMS deviation [mm]',
    description:
      'The maximum RMS value of the field CAX to BB for the couch axis images in mm. This is an alternative to the max/mean/median calculations.',
    key: 'max_couch_rms_deviation_mm',
  },
  {
    title: 'Maximum EPID RMS deviation',
    description:
      'The maximum RMS value of the field CAX to EPID center for the EPID images in mm. This is an alternative to the max/mean/median calculations.',
    key: 'max_epid_rms_deviation_mm',
  },
  {
    title: 'Gantry+Collimator 3D isocenter diameter',
    description:
      'The 3D isocenter diameter of the gantry and collimator axes as determined by the gantry and collimator images in mm. This uses backprojection lines of the field center to the source and minimizes a sphere that touches all the backprojection lines.',
    key: 'gantry_coll_3d_iso_diameter_mm',
  },
  {
    title: 'Collimator 2D isocenter diameter',
    description: 'The 2D isocenter diameter of the collimator axis only as determined by the collimator images in mm.',
    key: 'coll_2d_iso_diameter_mm',
  },
  {
    title: 'Couch 2D isocenter diameter',
    description: 'The 2D isocenter diameter of the couch axis only as determined by the couch images in mm.',
    key: 'couch_2d_iso_diameter_mm',
  },
];

export const PLOTS = [
  {
    title: 'Summary',
    description: 'Plot showing the gantry sag and wobble plots of the three axes.',
    filename: 'summary_plot.png',
  },
  {
    title: 'Isocenter Visualization',
    description:
      'Plot of isocenter and size as a sphere in 3D space relative to the BB. The iso is at the origin. Only images where the couch was at zero are considered.',
    filename: 'location_plot.png',
  },
];
