import json

pixel_start = 0
pixel_end = 639
size_of_image_mm = 340

def mm_to_pixel(mm: float, image_size_pixel: int, image_size_mm: float) -> int:
  return round(mm * image_size_pixel / image_size_mm)

def generate_leaves(leaves: list, start_id: list, start_pixel: int, no_leaves: int, width_mm: float, side: str, x: int, additional_width = 0):
  last_y_1 = start_pixel - 1

  for i in range(no_leaves):
    y_0 = last_y_1 + 1
    last_y_1 = y_1 = y_0 + mm_to_pixel(width_mm, pixel_end - pixel_start + 1, size_of_image_mm) + additional_width
    l_id = start_id + i

    leaves.append({
      "id": l_id,
      "y_0": y_0,
      "y_1": y_1,
      "x": x,
      "side": side,
    })

  return leaves, last_y_1, l_id

if __name__ == "__main__":
  leaves, last_y_1, l_id = generate_leaves([], 1, 83, 14, 5, "left", 316)
  leaves, last_y_1, l_id = generate_leaves(leaves, l_id + 1, last_y_1 + 1, 14, 2.5, "left", 316)
  leaves, last_y_1, l_id = generate_leaves(leaves, l_id + 1, last_y_1 + 1, 4, 2.5, "left", 306)
  leaves, last_y_1, l_id = generate_leaves(leaves, l_id + 1, last_y_1 + 1, 14, 2.5, "left", 316)
  leaves, last_y_1, l_id = generate_leaves(leaves, l_id + 1, last_y_1 + 1, 14, 5, "left", 316)

  leaves, last_y_1, l_id = generate_leaves(leaves, l_id + 1, 83, 14, 5, "right", 323)
  leaves, last_y_1, l_id = generate_leaves(leaves, l_id + 1, last_y_1 + 1, 14, 2.5, "right", 323)
  leaves, last_y_1, l_id = generate_leaves(leaves, l_id + 1, last_y_1 + 1, 4, 2.5, "right", 334)
  leaves, last_y_1, l_id = generate_leaves(leaves, l_id + 1, last_y_1 + 1, 14, 2.5, "right", 323)
  leaves, last_y_1, l_id = generate_leaves(leaves, l_id + 1, last_y_1 + 1, 14, 5, "right", 323)

  with open("l.json", "w") as f:
    json.dump(leaves, f, indent=2)
