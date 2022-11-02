
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
	global topics
	while len(topics)<1:
		print(f"len of topic is {len(topics)}")
		time.sleep(1)
		get_sensor()
		topics = sensor_dict.values()
		if (len(topics)>1):
			break

	for topic in topics:
		client.subscribe("mistral/"+topic, 1)
		
		
def on_message(client, userdata, msg):
	payload = json.loads(msg.payload)
	print(f"msg value is {msg}")
	print(f"msg.payload value is {msg.payload}")
	print((f"actualpayload value is {payload}"))	
	now = datetime.now(tz_NY)
	ts = time.mktime(now.timetuple())
	# write to database here
	sensor_db=db_wrapper.db(database='sensor_data',user=user_name,password=pword,host=host_ip,port=port_num)
	sensor_table = db_wrapper.table(sensor_db)
	sensor_table.insert("logging_data", timestamp=ts, device_id=payload['mac_id'], sensor_id=payload['sensor_id'], value=payload['value'])
	print(f"database insertion values {payload['sensor_id']} -- {payload['mac_id']} --{payload['value']}")
	print("Valid payload, wrote to DB.")

	

client = mqtt.Client("neerniali_sub", clean_session=False)
client.on_connect = on_connect
client.on_message = on_message

client.connect(host_name, port, keepalive)
client.loop_forever()
