#!/bin/sh

set -e

export EXTERNAL_IP=$(docker-machine ip)

python manage.py collectstatic --noinput

uwsgi --socket :8000 --master --enable-threads --module myDjangoProject.wsgi


