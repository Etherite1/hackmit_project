import os, pandas as pd
from sqlalchemy import create_engine, text
import numpy as np

def convert_string_to_vector(embedding_str):
    # Remove brackets and split by space
    embedding_list = embedding_str.strip('[]').split(',')
    # Convert the list of strings to floats and then to a NumPy array
    return [float(i) for i in embedding_list]


username = 'demo'
password = 'demo'
hostname = os.getenv('IRIS_HOSTNAME', 'localhost')
port = '1972' 
namespace = 'USER'
CONNECTION_STRING = f"iris://{username}:{password}@{hostname}:{port}/{namespace}"
engine = create_engine(CONNECTION_STRING)

with engine.connect() as conn:
    with conn.begin():
        sql = text("""
            SELECT TOP 3 * FROM query_info 
            WHERE difficulty = :difficulty
            AND category = :category
        """)
        results = conn.execute(sql, {'difficulty': 'Level 5', 'category': 'Algebra'})

print("first 3 rows of query_info:")
for result in results:
    print(result)
