from flask import Flask, jsonify
from flask_cors import CORS
import json
import numpy as np

app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes

@app.route("/<string:query>")
def query_embedding(query):
    arr = np.zeros(768, dtype=np.float64).tolist()

    return jsonify(arr)

if __name__ == "__main__":
    app.run(debug=True)