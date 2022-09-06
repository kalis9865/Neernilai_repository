FROM python:3.9.5-alpine

ENV PATH="/scripts:${PATH}"

COPY ./requirements.txt /requirements.txt
RUN apk add --update --no-cache --virtual .tmp gcc libc-dev linux-headers
RUN pip install -r /requirements.txt
RUN apk del .tmp

WORKDIR /web
COPY ./scripts /scripts
RUN chmod +x /scripts/*

COPY . .
CMD ["entrypoint.sh"]

