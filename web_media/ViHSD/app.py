from flask import Flask, request, render_template, jsonify
from flask_cors import CORS
import tensorflow as tf
import pickle
import numpy as np
from pyvi.ViTokenizer import ViTokenizer
from keras.models import model_from_json
from keras.preprocessing import text, sequence

app = Flask(__name__) 
CORS(app, origins=['http://localhost:3000'], supports_credentials=True)
json_file = open('C:/Users/Admin/Documents/GitHub/WebSocialMedia/web_media/ViHSD/model/Text_CNN_model_v13.json','r')
loaded_model_json = json_file.read()
loaded_model = model_from_json(loaded_model_json)
loaded_model.load_weights("C:/Users/Admin/Documents/GitHub/WebSocialMedia/web_media/ViHSD/model/Text_CNN_model_v13.h5")
json_file.close()

tokenizer = pickle.load(open('C:/Users/Admin/Documents/GitHub/WebSocialMedia/web_media/ViHSD/model/tokenizer.pickle', 'rb'))

STOPWORDS = 'C:/Users/Admin/Documents/GitHub/WebSocialMedia/web_media/ViHSD/model/vietnamese-stopwords-dash.txt'
with open(STOPWORDS, "r", encoding="utf8") as ins:
    stopwords = []
    for line in ins:
        dd = line.strip('\n')
        stopwords.append(dd)
    stopwords = set(stopwords)

def filter_stop_words(train_sentences, stop_words):
    new_sent = [word for word in train_sentences.split() if word not in stop_words]
    train_sentences = ' '.join(new_sent)

    return train_sentences

def deEmojify(text):
    regrex_pattern = re.compile(pattern = "["
        u"\U0001F600-\U0001F64F"  # emoticons
        u"\U0001F300-\U0001F5FF"  # symbols & pictographs
        u"\U0001F680-\U0001F6FF"  # transport & map symbols
        u"\U0001F1E0-\U0001F1FF"  # flags (iOS)
                           "]+", flags = re.UNICODE)
    return regrex_pattern.sub(r'',text)

def preprocess(text, tokenized = True, lowercased = True):
    text = ViTokenizer.tokenize(text) if tokenized else text
    text = filter_stop_words(text, stopwords)
    # text = deEmojify(text)
    text = text.lower() if lowercased else text
    return text


#-----APP-----
@app.route('/', methods = ['GET'])
def index_view():
    return render_template("/index.html")

@app.route('/',methods=['POST'])
def predict():
    text = request.get_json()
    text = text['text']
    text = [preprocess(text,tokenized=True,lowercased=True)]
    for idx, ele in enumerate(text):
        if not ele:
            np.delete(text, idx)
    text = tokenizer.texts_to_sequences(text)
    text = sequence.pad_sequences(text, maxlen=100)

    prediction = loaded_model.predict(text,batch_size=256, verbose=0)
    prediction = prediction[0]
    keys = ['0', '1', '2']
    dictionary = dict(zip(keys,prediction))
    max_key = max(dictionary, key=dictionary.get)
    
    result = '{}'.format(max_key)
    # result = '{}: {}%'.format(max_key,dictionary[max_key]*100) # trả về dự đoán và phần trăm dự đoán
    
    return jsonify({'result':result})
    
    # return render_template("/index.html", prediction = result)
    # return '{}: {}%'.format(max_key,dictionary[max_key]*100)
    # return render_template('index.html', prediction_text='Predicted Species: {}'.format(prediction)) # Render the predicted result


if __name__ == '__main__':
    app.run(port=8001, debug=True)