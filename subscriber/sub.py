
import json

import paho.mqtt.client as mqtt
from configparser import ConfigParser
import pytz
from datetime import datetime
import time

from db import db_wrapper

#setting timezone
tz_NY = pytz.timezone('Asia/Kolkata')

config_obj = db_wrapper.configure()
db_name,user_name,pword,host_ip,port_num,host_name,mqtt_port,keepalive = config_obj.config()

db_obj=db_wrapper.db(database=db_name,user=user_name,password=pword,host=host_ip,port=port_num)
table_obj = db_wrapper.table(db_obj)

dev_dict = {} # to store device details
sensor_dict = {} # to get the sensor names
mac_device_dict = {} # to store a mapping of macids with devices

def get_sensor():
	global sensor_dict
	rows = table_obj.get_data("sensors")
	if rows:
		for row in rows:
			if row[0] not in sensor_dict.keys():
				sensor_dict[row[0]] = row[1]

get_sensor()
print(sensor_dict)

#config.ini
config = ConfigParser()
config.read('config.ini')

host_name = config.get('mqtt','host_name')
port = config.getint('mqtt','port')
keepalive = config.getint('mqtt','keepalive')
topics = sensor_dict.values()

def on_connect(client, userdata, rc, buf):
	print("Connected with result code "+str(rc))

	for topic in topics:
		client.subscribe("mistral/"+topic)

def get_devices() -> None:
	global mac_device_dict, dev_dict
	# gets all devices
	config_db=db_wrapper.db(database='config_db',user=user_name,password=pword,host=host_ip,port=port_num)
	devices_table = db_wrapper.table(config_db)
	devices = devices_table.get_device('device')
	for device in devices:
		dev_dict[device[0]] = dict(
			mac_id=device[2],
			sensor_ids=device[3]
		)
	##print(f"Devices: {dev_dict}")
	mac_device_dict = {}
	for entry in devices:
		mac_device_dict[entry[2]] = entry[0]
		sensor_dict[entry[0]] = entry[3]	
	##print(mac_device_dict)
	##print(dev_dict)
	# print(sensor_dict)

def payload_is_valid(payload, msg) -> bool:
	# add check for if the sensor is publishing to the right topic
	get_sensor()
	get_devices()

	if not ('sensor_id' in payload.keys() or 'mac_id' in payload.keys() or 'value' in payload.keys()):
		print(">>>>>>>>>>>>>>>>>>>>>> DB 1")
		return False

	if not payload['sensor_id'] in sensor_dict.keys():
		return False
	print(">>>>>>>>>>>>>>>>>>>>>> DB 2")

	print(mac_device_dict)
	if not payload['mac_id'] in mac_device_dict.keys():
		return False

	print(">>>>>>>>>>>>>>>>>>>>>> DB 3")
	device_sensors = dev_dict[mac_device_dict[payload['mac_id']]]['sensor_ids']
	print(f"device_sensors value is {device_sensors}")
	if not str(payload['sensor_id']) in device_sensors:
		return False
		print(">>>>>>>>>>>>>>>>>>>>>> DB 4")

	return True

def on_message(client, userdata, msg):
	payload = json.loads(msg.payload)
	print(f"msg value is {msg}")
	print(f"msg.payload value is {msg.payload}")
	print((f"actualpayload value is {payload}"))
	##print(payload)
	# add sensor sanity checks
	# fetch devices and their respective sensors
	get_devices()
	if payload_is_valid(payload, msg):
		now = datetime.now(tz_NY)
		ts = time.mktime(now.timetuple())
		# write to database here
		sensor_db=db_wrapper.db(database='sensor_data',user=user_name,password=pword,host=host_ip,port=port_num)
		sensor_table = db_wrapper.table(sensor_db)
		# sensor_table.insert("logging_data", timestamp=ts, device_id=payload['mac_id'], sensor_id=payload['sensor_id'], value=payload['value'])
		print("Valid payload, wrote to DB.")

	

client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

client.connect(host_name, port, keepalive)

client.loop_forever()
