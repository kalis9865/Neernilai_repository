
FROM python:3.8-slim-buster

ENV VIRTUAL_ENV "/venv"
RUN python -m venv $VIRTUAL_ENV
ENV PATH "$VIRTUAL_ENV/bin:$PATH"

WORKDIR /subscriber

RUN pip3 install paho-mqtt

COPY config.ini config.ini
COPY sub.py sub.py

CMD ["python3","-u","sub.py"]
