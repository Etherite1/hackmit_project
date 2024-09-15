import os, pandas as pd
from sqlalchemy import create_engine, text
import numpy as np

def convert_string_to_vector(embedding_str):
    # Remove brackets and split by space
    embedding_list = embedding_str.strip('[]').split(',')
    # Convert the list of strings to floats and then to a NumPy array
    return [float(i) for i in embedding_list]

def populate_db():
    username = 'demo'
    password = 'demo'
    hostname = os.getenv('IRIS_HOSTNAME', 'localhost')
    port = '1972' 
    namespace = 'USER'
    CONNECTION_STRING = f"iris://{username}:{password}@{hostname}:{port}/{namespace}"

    engine = create_engine(CONNECTION_STRING)

    df = pd.read_csv('embeddings-1.csv')

    with engine.connect() as conn:
        with conn.begin():# Load 
            sql = f"""
                    DROP TABLE IF EXISTS query_info
                    """
            result = conn.execute(text(sql))

    
    with engine.connect() as conn:
        with conn.begin():# Load 
            sql = f"""
                    CREATE TABLE IF NOT EXISTS query_info (
            id VARCHAR(255),
            category VARCHAR(255),
            difficulty VARCHAR(2000),
            embedding VECTOR(DOUBLE, 768)
            )
                    """
            result = conn.execute(text(sql))

    df['embedding'] = df['embedding'].apply(convert_string_to_vector)

    with engine.connect() as conn:
        with conn.begin():
            for index, row in df.iterrows():
                sql = """
                    INSERT INTO query_info
                    (id, category, difficulty, embedding) 
                    VALUES (:id, :category, :difficulty, TO_VECTOR(:embedding))
                """
                conn.execute(text(sql), {
                    'id': row['id'], 
                    'category': row['category'], 
                    'difficulty': row['difficulty'], 
                    'embedding': str(row['embedding'])  # Convert embedding to list
                })

    with engine.connect() as conn:
        with conn.begin():
            sql = text("""
                SELECT TOP 3 * FROM query_info 
                WHERE difficulty == "Level 5"
            """)

        results = conn.execute(sql).fetchall()

    print("first 3 rows of query_info:")
    for result in results:
        print(result)

if __name__ == '__main__':
    populate_db()


    