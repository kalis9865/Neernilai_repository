FROM python:3.8-slim-buster

# Set up and activate virtual environment
ENV VIRTUAL_ENV "/venv"
RUN python -m venv $VIRTUAL_ENV
ENV PATH "$VIRTUAL_ENV/bin:$PATH"

WORKDIR /publisher

COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt

COPY db db/
COPY config.ini config.ini
COPY pub.py pub.py

CMD ["python3","pub.py"]
