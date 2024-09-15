# To run frontend

    $ npm i
    $ npm run dev

# To run backend

    $ cd api
    $ pip3 install flask
    $ pip3 install flask-cors
    $ python3 -m flask --app main run 

# To populate iris vector database

    $ cd api
    $ docker run -d --name iris-comm -p 1972:1972 -p 52773:52773 -e IRIS_PASSWORD=demo -e IRIS_USERNAME=demo intersystemsdc/iris-community:latest
    $ activate venv
    $ pip3 install -r iris_reqs.txt
    $ python3 populate_db.py
