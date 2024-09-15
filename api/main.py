import os
from sqlalchemy import create_engine, text
from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import json

app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes

@app.route("/", methods=['POST'])
def query_embedding():
    username = 'demo'
    password = 'demo'
    hostname = os.getenv('IRIS_HOSTNAME', 'localhost')
    port = '1972' 
    namespace = 'USER'
    CONNECTION_STRING = f"iris://{username}:{password}@{hostname}:{port}/{namespace}"
    engine = create_engine(CONNECTION_STRING)

    data = request.get_json()  # Use Flask's request object to get JSON data
    print("dadadadad", data)
    query = data.get('query', '')  # Safely get 'query' from the JSON data
    category = data.get('category', '')
    difficulty = data.get('difficulty', '')

    url = 'http://127.0.0.1:5000/'
    headers = {'Content-Type': 'application/json'}
    data = {'query': query}
    print("quququq", query)
    response = requests.post(url, headers=headers, data=json.dumps(data))
    search_vector = json.loads(response.text)
    
    results = None
    with engine.connect() as conn:
        with conn.begin():
            if category == 'All':
                if difficulty == 'All':
                    sql = text("""
                        SELECT TOP 100 * FROM query_info 
                        ORDER BY VECTOR_COSINE(embedding, TO_VECTOR(:search_vector)) DESC
                    """)
                    results = conn.execute(sql, {'search_vector': str(search_vector)})
                else:
                    sql = text("""
                        SELECT TOP 100 * FROM query_info 
                        WHERE difficulty = :difficulty
                        ORDER BY VECTOR_COSINE(embedding, TO_VECTOR(:search_vector)) DESC
                    """)
                    results = conn.execute(sql, {'difficulty': difficulty, 'search_vector': str(search_vector)})
            else:
                if difficulty == 'All':
                    sql = text("""
                        SELECT TOP 100 * FROM query_info 
                        WHERE category = :category
                        ORDER BY VECTOR_COSINE(embedding, TO_VECTOR(:search_vector)) DESC
                    """)
                    results = conn.execute(sql, {'category': category, 'search_vector': str(search_vector)})
                else:
                    sql = text("""
                        SELECT TOP 100 * FROM query_info 
                        WHERE difficulty = :difficulty
                        AND category = :category
                        ORDER BY VECTOR_COSINE(embedding, TO_VECTOR(:search_vector)) DESC
                    """)
                    print(type(search_vector), type(search_vector[0]))
                    results = conn.execute(sql, {'difficulty': difficulty, 'category': category, 'search_vector': str(search_vector)})

    ret = []
    for res in results:
        ret.append(res[0])

    return json.dumps(ret)

if __name__ == "__main__":
    app.run(debug=True)
