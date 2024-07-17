import cv2
import numpy as np
from flask import Flask, request, render_template, jsonify
from flask_cors import CORS
import requests
import mysql.connector
import os

app = Flask(__name__) 
CORS(app, origins=['http://localhost:3000'], supports_credentials=True)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

# Kết nối database
mydb = mysql.connector.connect(
    host="localhost",
    user="root",
    password="123456789",
    database="socialmedia"
)
mycursor = mydb.cursor(dictionary=True)

# Load Yolo
net = cv2.dnn.readNet("yolov3_training_2000.weights", "yolov3_testing.cfg")
classes = ["Weapon"]
output_layer_names = net.getUnconnectedOutLayersNames()
colors = np.random.uniform(0, 255, size=(len(classes), 3))

@app.route('/',methods = ['GET'])
def home():
    mycursor.execute("select id, profilePic from posts where profilePic != ''")
    data = mycursor.fetchall()
 
    return data

@app.route('/predict', methods = ['POST'])
def index_view():
    data = request.get_json()
    if 'text' in data:
        # Image from URL
        image_url = data['text']
        try:
            response = requests.get(image_url, stream=True)
            response.raise_for_status()

            with open('test.jpg', 'wb') as file:
                for chunk in response.iter_content(chunk_size=8192):
                    file.write(chunk)

            print("Image successfully downloaded")
            img = cv2.imread('test.jpg')
        except requests.exceptions.RequestException as e:
            print(f"Error downloading image: {e}")
            return jsonify({'error': 'Error downloading image'}), 400
    elif 'file' in request.files:
        # Image from file upload
        image_file = request.files['file']
        image_path = os.path.join('uploads', image_file.filename)
        image_file.save(image_path)
        img = cv2.imread(image_path)
    else:
        return jsonify({'error': 'No image source provided'}), 400

    if img is None:
        print("Error: Could not read the image file.")
        return jsonify({'error': 'Could not read the image file'}), 400
    
    height, width, channels = img.shape

    # Detecting objects
    blob = cv2.dnn.blobFromImage(img, 0.00392, (416, 416), (0, 0, 0), True, crop=False)
    net.setInput(blob)
    outs = net.forward(output_layer_names)

    # Showing information on the screen
    class_ids = []
    confidences = []
    boxes = []
    for out in outs:
        for detection in out:
            scores = detection[5:]
            class_id = np.argmax(scores)
            confidence = scores[class_id]
            if confidence > 0.5:
                # Object detected
                center_x = int(detection[0] * width)
                center_y = int(detection[1] * height)
                w = int(detection[2] * width)
                h = int(detection[3] * height)

                # Rectangle coordinates
                x = int(center_x - w / 2)
                y = int(center_y - h / 2)

                boxes.append([x, y, w, h])
                confidences.append(float(confidence))
                class_ids.append(class_id)

    indexes = cv2.dnn.NMSBoxes(boxes, confidences, 0.5, 0.4)
    results = []
    font = cv2.FONT_HERSHEY_PLAIN
    for i in range(len(boxes)):
        if i in indexes:
            x, y, w, h = boxes[i]
            label = str(classes[class_ids[i]])
            color = colors[class_ids[i]]
            cv2.rectangle(img, (x, y), (x + w, y + h), color, 2)
            cv2.putText(img, label, (x, y + 30), font, 3, color, 3)
            results.append([str(label), [x, y, w , h]])

    # Hiển thị hình ảnh kết quả
    # cv2.imshow("Image", img)
    # cv2.waitKey(0)
    # cv2.destroyAllWindows()
    
    return jsonify({'results':results, 'size':[width , height]})
    
if __name__ == '__main__':
    app.run(port=8003, debug=True)