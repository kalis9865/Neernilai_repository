FROM python:3.8-slim-buster

# Set up and activate virtual environment
ENV VIRTUAL_ENV "/venv"
RUN python -m venv $VIRTUAL_ENV
ENV PATH "$VIRTUAL_ENV/bin:$PATH"

WORKDIR /publisher

RUN pip3 install paho-mqtt

COPY config.ini config.ini
COPY pub.py pub.py

CMD ["python3","pub.py"]
