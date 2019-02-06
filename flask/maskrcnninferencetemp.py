import cv2
import numpy as np
import maskrcnntrain
from mrcnn import utils
from mrcnn import model as modellib
import os
import json
import pandas as pd

selection = 2
TEST_IMAGE = "test.jpg"
LOGS_FOLDER = "logs"
PRETRAINED_COCO_WEIGHTS = "mask_rcnn_coco.h5"
WEIGHTS_TO_USE = "trained"
TRAINED_MASKRCNN_TREE_WEIGHTS = "mask_rcnn_tree_0030_images_1-160.h5"
TRAINED_MASKRCNN_BUILDINGS_WEIGHTS = "mask_rcnn_building_0030.h5"
CLASS_TREE = "Tree"
CLASS_BUILDING = "Building"
IMG_DIR = "testimage"
INFERED_DIR = "testimageinfer"

class InferenceConfigtree(maskrcnntrain.trainingconfig):
    GPU_COUNT = 1
    IMAGES_PER_GPU = 1
    DETECTION_MIN_CONFIDENCE = 0.5

configtree = InferenceConfigtree()
print('Tree Detection Config....')
configtree.display()

class InferenceConfigbuilding(maskrcnntrain.trainingconfig):
    GPU_COUNT = 1
    IMAGES_PER_GPU = 1
    DETECTION_MIN_CONFIDENCE = 0.85

configbuilding = InferenceConfigbuilding()
print('Building Detection Config....')
configbuilding.display()

model_tree = modellib.MaskRCNN(
    mode = "inference", model_dir = LOGS_FOLDER, config = configtree
)

model_building = modellib.MaskRCNN(
    mode = "inference", model_dir = LOGS_FOLDER, config = configbuilding
)

if WEIGHTS_TO_USE == "coco":
    weights_path = PRETRAINED_COCO_WEIGHTS
    model.load_weights(weights_path, by_name=True)
    class_names = [
        'BG', 'person', 'bicycle', 'car', 'motorcycle', 'airplane',
        'bus', 'train', 'truck', 'boat', 'traffic light',
        'fire hydrant', 'stop sign', 'parking meter', 'bench', 'bird',
        'cat', 'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear',
        'zebra', 'giraffe', 'backpack', 'umbrella', 'handbag', 'tie',
        'suitcase', 'frisbee', 'skis', 'snowboard', 'sports ball',
        'kite', 'baseball bat', 'baseball glove', 'skateboard',
        'surfboard', 'tennis racket', 'bottle', 'wine glass', 'cup',
        'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple',
        'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog', 'pizza',
        'donut', 'cake', 'chair', 'couch', 'potted plant', 'bed',
        'dining table', 'toilet', 'tv', 'laptop', 'mouse', 'remote',
        'keyboard', 'cell phone', 'microwave', 'oven', 'toaster',
        'sink', 'refrigerator', 'book', 'clock', 'vase', 'scissors',
        'teddy bear', 'hair drier', 'toothbrush'
    ]
elif WEIGHTS_TO_USE == "last":
    weights_path = model.find_last()[1]
    model.load_weights(weights_path, by_name=True)
    class_names = CLASS

else:
    tree_weights_path = TRAINED_MASKRCNN_TREE_WEIGHTS
    building_weights_path = TRAINED_MASKRCNN_BUILDINGS_WEIGHTS
    model_tree.load_weights(tree_weights_path, by_name=True)
    model_building.load_weights(building_weights_path, by_name=True)
    class_names_tree = CLASS_TREE
    class_names_building = CLASS_BUILDING

def random_colors(N):
    colors = [tuple(255 * np.random.rand(3)) for _ in range(N)]
    return colors

#colors = random_colors(len(class_names))
#class_dict = {
#    name: color for name, color in zip(class_names, colors)
#}

def apply_mask(image, mask, color, alpha = 0.7):
    """apply mask to image"""
    for n, c in enumerate(color):
        image[:, :, n] = np.where(
            mask == 1,
            image[:, :, n] * (1 - alpha) + alpha *c,
            image[:, :, n]
        )
    return image

def display_instances(image, boxes, masks, ids, names, scores, color):
    """
        take the image and results and apply the mask, box, and label
    """
    n_instances = boxes.shape[0]

    if not n_instances:
        print('NO INSTANCES TO DISPLAY')
    else:
        assert boxes.shape[0] == masks.shape[-1] == ids.shape[0]

    for i in range(n_instances):
        if not np.any(boxes[i]):
            continue

        #y1, x1, y2, x2 = boxes[i]
        #label = names[ids[i]]
        #color = class_dict[label]
        #score = scores[i] if scores is not None else None
        #caption = '{}{:.2f}'.format(label, score) if score else label
        mask = masks[:, :, i]
        image = apply_mask(image, mask, color)
        #image =cv2.rectangle(image, (x1, y1), (x2, y2), color, 10)
        #image = cv2.putText(image, caption, (x1, y1), cv2.FONT_HERSHEY_COMPLEX, 0.5, color, 2)

    return image, n_instances

def main():
    total_trees = 0
    total_buildings = 0
    for filename in os.listdir(IMG_DIR):
        if selection == 0:
            test_image = cv2.imread(os.path.join(IMG_DIR,filename))
            results = model_tree.detect([test_image], verbose = 0)
            r = results[0]
            infered, number_of_instances = display_instances(
                test_image, r['rois'], r['masks'], r['class_ids'], class_names_tree, r['scores'], [255, 128, 0]
            )
            print(number_of_instances)
            total_trees = total_trees + number_of_instances
        elif selection == 1:
            test_image = cv2.imread(os.path.join(IMG_DIR,filename))
            results = model_building.detect([test_image], verbose = 0)
            r = results[0]
            infered, number_of_instances = display_instances(
                test_image, r['rois'], r['masks'], r['class_ids'], class_names_building, r['scores'], [0, 128, 255]
            )
            print(number_of_instances)
            total_buildings = total_buildings + number_of_instances
        else:
            test_image = cv2.imread(os.path.join(IMG_DIR,filename))
            temp = test_image
            results = model_tree.detect([test_image], verbose = 0)
            r = results[0]
            infered_temp, number_of_tree_instances = display_instances(
                test_image, r['rois'], r['masks'], r['class_ids'], class_names_tree, r['scores'], [255, 128, 0]
            )
            print('Saved')
            cv2.imwrite('temp.jpg', temp)
            test_image = cv2.imread(os.path.join(IMG_DIR,filename))
            results = model_building.detect([test_image], verbose = 0)
            r = results[0]
            infered, number_of_building_instances = display_instances(
                infered_temp, r['rois'], r['masks'], r['class_ids'], class_names_building, r['scores'], [0, 128, 255]
            )
            total_trees = total_trees + number_of_tree_instances
            total_buildings = total_buildings + number_of_building_instances
            print("Number of trees detected: " + str(number_of_tree_instances))
            print("Number of buildings detected: " + str(number_of_building_instances))
        cv2.imwrite(os.path.join(INFERED_DIR,filename), infered)

    print("Total trees detected: " + str(total_trees))
    print("Total buildings detected: " + str(total_buildings))

if __name__ == "__main__":
    main()
