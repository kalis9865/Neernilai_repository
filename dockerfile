FROM python:3.9.5-alpine

ENV PATH="/scripts:${PATH}"

COPY ./requirements.txt /requirements.txt
RUN apk add --update --no-cache --virtual .tmp gcc libc-dev linux-headers
RUN apk update && apk add postgresql-dev gcc python3-dev musl-dev
RUN pip3 install -r ./requirements.txt
RUN apk del .tmp

RUN mkdir /app
COPY ./app app
WORKDIR /app
COPY ./scripts /scripts

RUN chmod +x /scripts/*

RUN mkdir -p /vol/web/media
RUN mkdir -p /vol/web/static

RUN adduser -D user
RUN chown -R user:user /vol
RUN chown -R user:user /app
RUN chmod -R 755 /vol/web
USER user


CMD ["entrypoint.sh"]
