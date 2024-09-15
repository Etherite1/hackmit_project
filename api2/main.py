from flask import Flask, jsonify, request
from flask_cors import CORS
import numpy as np

app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes

@app.route("/", methods=['POST'])
def query_embedding():
    # Get the query from the POST request data
    data = request.get_json()  # Use Flask's request object to get JSON data
    query = data.get('query', '')  # Safely get 'query' from the JSON data
    
    # Create an array of zeros with 768 elements, dtype float64
    arr = np.zeros(768, dtype=np.float64).tolist()

    # Return the list as JSON, along with the received query
    return jsonify({
        'query': query,
        'embedding': arr,
    })

if __name__ == "__main__":
    app.run(debug=True)
