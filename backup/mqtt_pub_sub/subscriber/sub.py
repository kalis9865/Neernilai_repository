
import json

import paho.mqtt.client as mqtt
from configparser import ConfigParser

#config.ini
config = ConfigParser()
config.read('config.ini')

host_name = config.get('mqtt','host_name')
port = config.getint('mqtt','port')
keepalive = config.getint('mqtt','keepalive')

#mqtt
topics = ["temperature","pressure","co2","level","ambient"]

def on_connect(client, userdata, rc, buf):
	print("Connected with result code "+str(rc))

	for topic in topics:
		client.subscribe("mistral/"+topic)

def on_message(client, userdata, msg):
    payload = json.loads(msg.payload)
    print(payload)

client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

client.connect(host_name, port, keepalive)

client.loop_forever()
