import os, io, zipfile, pydicom
import numpy as np
import matplotlib.pyplot as plt
import cv2
import json
import statistics

DATA_PATH = '/app/var/dose3d/uploads'

RED = 121
GREEN = 122
YELLOW = 123
BLUE = 124

def preprocess(filename: str, params: dict) -> io.BytesIO:
    initial_image = _load_dicom_as_ndarray(filename)
    (preprocessed_image_left, preprocessed_image_right) = _extract_edges(initial_image, params)
    combined_image = _combine_binary_images(preprocessed_image_left, preprocessed_image_right)
    return _zip_images_and_text([initial_image, combined_image], ["initial.png", "preprocessed.png"])

def analyze(filename: str, leaves_filename: str, params: dict) -> io.BytesIO:
    initial_image = _load_dicom_as_ndarray(filename)

    # Algorithm definition

    # 1. Determine the edges
    (preprocessed_image_left, preprocessed_image_right) = _extract_edges(initial_image, params)

    # 2. Detect upper and lower boundaries
    y_min_left, y_max_left = _detect_boundaries(preprocessed_image_left)
    y_min_right, y_max_right = _detect_boundaries(preprocessed_image_right)

    leaves = _load_leaves_from_file(leaves_filename)
    leaves_left, leaves_right = _split_leaves_left_right(leaves)

    leaves_errors_left, image_algo_left = _perform_analysis(preprocessed_image_left, leaves_left, params['tolerance_x'], params['tolerance_y'], y_min_left, y_max_left, params['x_mm'])
    leaves_errors_right, image_algo_right = _perform_analysis(preprocessed_image_right, leaves_right, params['tolerance_x'], params['tolerance_y'], y_min_right, y_max_right, params['x_mm'])

    image_algo_rgb_left = _convert_gray_to_rgb(image_algo_left)
    image_algo_rgb_right = _convert_gray_to_rgb(image_algo_right)

    image_colored_left = _draw_color_codes(image_algo_rgb_left)
    image_colored_right = _draw_color_codes(image_algo_rgb_right)

    ok_leaves_left, errored_leaves_left = _split_leaves_ok_errored(leaves_left, leaves_errors_left, params['permitted_errors_per_leaf'])
    ok_leaves_right, errored_leaves_right = _split_leaves_ok_errored(leaves_right, leaves_errors_right, params['permitted_errors_per_leaf'])

    image_colored_leaves_left = _draw_leaves(image_colored_left, ok_leaves_left, errored_leaves_left)
    image_colored_leaves_right = _draw_leaves(image_colored_right, ok_leaves_right, errored_leaves_right)

    initial_with_leaves = _draw_leaves(_convert_gray_to_rgb(initial_image), ok_leaves_left + ok_leaves_right, errored_leaves_left + errored_leaves_right)
    combined_image = _combine_binary_images(preprocessed_image_left, preprocessed_image_right)
    combined_with_leaves = _draw_leaves(_convert_gray_to_rgb(combined_image), ok_leaves_left + ok_leaves_right, errored_leaves_left + errored_leaves_right)

    return _zip_images_and_text([image_colored_left, image_colored_right, image_colored_leaves_left, image_colored_leaves_right, initial_image, combined_image, initial_with_leaves, combined_with_leaves], ['colored_left.png', 'colored_right.png', 'colored_leaves_left.png', 'colored_leaves_right.png', 'initial.png', 'combined.png', 'initial_with_leaves.png', 'combined_with_leaves.png'], json.dumps(errored_leaves_left + errored_leaves_right))

def _zip_images_and_text(images: list[np.ndarray], filenames: list[str], text: str = '') -> io.BytesIO:
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for image, filename in zip(images, filenames):
            plot_io = io.BytesIO()
            plt.close()
            plt.figure(figsize=(10, 10))
            plt.imshow(image, cmap='gray')
            plt.axis('off')
            plt.savefig(plot_io, format='png', bbox_inches='tight', pad_inches=0)
            zipf.writestr(filename, plot_io.getvalue())
            plot_io.close()

        if text:
          zipf.writestr('text.json', text)

    buffer.seek(0)
    return buffer

def _load_dicom_as_ndarray(filename: str) -> np.ndarray:
    file_path = os.path.join(DATA_PATH, filename)
    dicom_file = pydicom.dcmread(file_path)
    pixel_array = dicom_file.pixel_array
    pixel_array_min = np.min(pixel_array)
    pixel_array_max = np.max(pixel_array)
    normalized_pixel_array = (pixel_array - pixel_array_min) / (pixel_array_max - pixel_array_min) * 255
    normalized_pixel_array = normalized_pixel_array.astype(np.uint8)
    return normalized_pixel_array

def _load_leaves_from_file(json_filename: str) -> list[dict]:
    file_path = os.path.join(DATA_PATH, json_filename)
    with open(file_path, 'r') as file:
        return json.load(file)

def _extract_edges(image: np.ndarray, params: dict) -> tuple[np.ndarray, np.ndarray]:
    # Algorithm for determining edges of leaves

    # 1. Binarise image
    _, binarized_image = cv2.threshold(image, params['threshold'], 255, cv2.THRESH_BINARY)

    # 2. Invert image
    inverted_image = cv2.bitwise_not(binarized_image)

    # 3. Apply morphological closing operation to ensure continuity of radiation field
    closed_image = cv2.morphologyEx(inverted_image, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_RECT,(params['SE_size'],params['SE_size'])))

    # 4. Apply Sobel filter for direction x
    sobel_x = cv2.Sobel(closed_image,cv2.CV_64F,1,0,ksize=params['sobel_kernel_size'])

    # 5. Perform two separate binarisations of image with two different thresholds, separating image into image with left edges, and image with right edges
    _, sobel_left = cv2.threshold(sobel_x, 50, 255, cv2.THRESH_BINARY)
    _, sobel_right = cv2.threshold(sobel_x, -50, 255, cv2.THRESH_BINARY_INV)

    # 6. Apply Sobel filter for direction y 
    sobel_y = cv2.Sobel(closed_image,cv2.CV_64F,0,1,ksize=params['sobel_kernel_size'])

    # 7. Calcuate gradient magnitude for each pixel
    abs_sobel_y = cv2.convertScaleAbs(sobel_y)

    # 8. Change the value of all pixels to no edge in the image from step 5 if in the image from step 6 corresponding pixel contains an edge
    sobel_left = sobel_left - abs_sobel_y
    sobel_left[sobel_left < 0] = 0
    sobel_left = sobel_left.astype(np.uint8)

    sobel_right = sobel_right - abs_sobel_y
    sobel_right[sobel_right < 0] = 0
    sobel_right = sobel_right.astype(np.uint8)

    # 9. Apply morphological closing separately on both images from step 8 to ensure continuity of edges
    left_closed = cv2.morphologyEx(sobel_left, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_RECT,(params['SE_size'],params['SE_size'])))
    right_closed = cv2.morphologyEx(sobel_right, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_RECT,(params['SE_size'],params['SE_size'])))

    return (left_closed, right_closed)

def _combine_binary_images(image1: np.ndarray, image2: np.ndarray) -> np.ndarray:
    return np.clip(image1 + image2, None, 255)

def _draw_leaves(image: np.ndarray, leaves: list[dict], errored_leaves: list[dict]) -> np.ndarray:
  def draw_leaf(leaf: dict, color: int):
    if leaf['side'] == "left":
      image[leaf["y_0"], :leaf["x"]] = color # down
      image[leaf["y_1"], :leaf["x"]] = color # up
      image[leaf["y_0"]:leaf["y_1"], leaf["x"]] = color # vertical
    if leaf['side'] == "right":
      image[leaf["y_0"], leaf["x"]:] = color # down
      image[leaf["y_1"], leaf["x"]:] = color # up
      image[leaf["y_0"]:leaf["y_1"], leaf["x"]] = color # vertical

  image = image.copy()

  color_ok = [100, 100, 255] # blue
  color_error = [255, 0, 0] # red

  for leaf in leaves:
    draw_leaf(leaf, color_ok)

  for leaf in errored_leaves:
    draw_leaf(leaf, color_error)


  return image

def _convert_gray_to_rgb(image: np.ndarray) -> np.ndarray:
    return cv2.cvtColor(image, cv2.COLOR_GRAY2RGB)

def _perform_analysis(image: np.ndarray, leaves: list[dict], tolerance_x: int, tolerance_y: int, y_min: int, y_max: int, x_mm: float) -> tuple[dict, np.ndarray]:
  image = image.copy()
  x_len, y_len = image.shape

  leaves_errors = {}

  def find_edge_X_for_y(y):
    edge_indices = []
    for x in range(x_len):
      if image[y,x] > 0:
        edge_indices.append(x)
    return edge_indices

  def edge_is_in_proximity(X, x, d):
    return (X[(x-d):(x+d)]).sum() > 0

  def append_errored_leaf(leaf, distance=None):
    if leaf['id'] not in leaves_errors:
      leaves_errors[leaf['id']] = {"errors": 0, "distances": []}
    leaves_errors[leaf['id']]['errors'] += 1
    if distance is not None: leaves_errors[leaf['id']]['distances'].append(distance)

  def is_error(y_0, y_1, y):
    return (y_0 + tolerance_y) <= y <= (y_1 - tolerance_y)

  for y in range(y_min, y_max):
    leaf = next((leaf for leaf in leaves if leaf['y_0'] <= y <= leaf['y_1']), None)
    if leaf is None:
      continue

    edge_indices = find_edge_X_for_y(y)
    is_edge_in_proximity = edge_is_in_proximity(image[y, :], leaf['x'], tolerance_x)

    color_ok = GREEN
    color_error = RED if is_error(leaf['y_0'], leaf['y_1'], y) else YELLOW

    if len(edge_indices) == 0: # no edge found
      image[y, :] = color_error
      if is_error(leaf['y_0'], leaf['y_1'], y):
        append_errored_leaf(leaf)

    elif is_edge_in_proximity: # edge found in tolerance
      for x in edge_indices:
        image[y, x] = color_ok

    else:  # edge not found in tolerance
      for x in edge_indices:
        image[y, x] = color_error
      if is_error(leaf['y_0'], leaf['y_1'], y):
        append_errored_leaf(leaf, abs(leaf['x'] - min(edge_indices, key=lambda x: abs(x - leaf['x']))))

  for leaf in leaves_errors.values():
    leaf['mean_distance_pixels'] = statistics.median(leaf['distances']) if leaf['distances'] else None
    leaf['mean_distance_mm'] = _1D_pixels_to_mm(leaf['mean_distance_pixels'], x_mm, x_len) if leaf['mean_distance_pixels'] else None

  return leaves_errors, image

def _detect_boundaries(image):
  _, Y = image.shape
  y_min = -1
  y_max = -1
  y_prev = 0
  for y in range(Y):
    if (image[:][y]).sum() > 0: # there is edge detected on this x coordinate
      if y_min == -1: # this is first pixel of edge detected
        y_min = y
      if y_prev == 1: # this is last pixel of edge detected
        y_max = y
      y_prev = 1
    else:
      y_prev = 0
  return y_min, y_max

def _draw_color_codes(image: np.ndarray) -> np.ndarray:
  image = image.copy()
  X, Y, _ = image.shape
  for x in range(X):
    for y in range(Y):
      if image[x][y][0] == RED:
        image[x][y] = [255, 0, 0]
      if image[x][y][0] == GREEN:
        image[x][y] = [0, 255, 0]
      if image[x][y][0] == YELLOW:
        image[x][y] = [255, 255, 0]
  return image

def _split_leaves_ok_errored(leaves, leaves_errors, tolerance):
  leaves_ok = []
  leaves_error = []
  for leaf in leaves:
    if leaf['id'] in leaves_errors and (leaves_errors[leaf['id']]['errors'] > tolerance):
      if leaves_errors[leaf['id']]['mean_distance_mm']:
        leaf['mean_distance_mm'] = leaves_errors[leaf['id']]['mean_distance_mm']
      if leaves_errors[leaf['id']]['mean_distance_pixels']:
        leaf['mean_distance_pixels'] = leaves_errors[leaf['id']]['mean_distance_pixels']
      leaves_error.append(leaf)
    else:
      leaves_ok.append(leaf)
  return leaves_ok, leaves_error

def _split_leaves_left_right(leaves):
  left = []
  right = []
  for leaf in leaves:
    if leaf['side'] == 'left':
      left.append(leaf)
    else:
      right.append(leaf)
  return left, right

def _1D_pixels_to_mm(pixels: int, image_length_mm: float, image_number_of_pixels: int) -> float:
    return pixels * (image_length_mm / image_number_of_pixels)