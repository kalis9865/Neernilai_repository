FROM python:3.8-slim-buster

WORKDIR /createdb

RUN pip3 install psycopg2-binary

ADD config.ini /createdb
ADD createdb.py /createdb
