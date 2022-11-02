
import time
import random
import _thread
import json

import paho.mqtt.client as mqtt
from configparser import ConfigParser

#config.ini
config = ConfigParser()
config.read('config.ini')
host_name = config.get('mqtt','host_name')
port = config.getint('mqtt','port')
keepalive = config.getint('mqtt','keepalive')


#random generator
def value_generator():
	values = []
	for i in range(1,6):
		value = random.randint(0,(i*100))
		values.append(value)

	return values


#mqtt
def on_connect(client, userdata, rc, buf):
    print("Publisher connected with result code "+str(rc))


def publish(mac):
	sensor_value = value_generator()
	topics = ["temperature","pressure","co2","level","ambient"]

	for i in range(0,5):
		json_data = json.dumps({'mac_id':mac,'value':sensor_value[i]})
		client.publish("mistral/"+topics[i],json_data)


#thread function
def pub_data():
	mac = "%02x-%02x-%02x" % (random.randint(0, 255),
                             random.randint(0, 255),
                             random.randint(0, 255))
	while True:
		publish(mac)
		time.sleep(1)


#mqtt connection
client = mqtt.Client()
client.on_connect = on_connect

client.connect(host_name, port, keepalive)


#starting thread
for i in range(0,3):
	try:
		_thread.start_new_thread(pub_data, ())
	except:
		print("Error: unable to start thread")

while True:
    pass
