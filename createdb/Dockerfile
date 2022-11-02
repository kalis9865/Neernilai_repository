FROM python:3.8-slim-buster

WORKDIR /createdb

RUN pip3 install psycopg2-binary

ADD config.ini /createdb
ADD createdb.py /createdb
COPY wait-for-it.sh wait-for-it.sh
CMD [ "sh", "-c", "./wait-for-it.sh -h db -p 5432 -t 60 && python3 ./createdb.py" ]
