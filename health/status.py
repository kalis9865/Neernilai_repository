import psycopg2
import paho.mqtt.client as mqtt

import collections
import json
import time
from configparser import ConfigParser

#config.ini
config = ConfigParser()
config.read('config.ini')

#mqtt
host_name = config.get('mqtt','host_name')
port = config.getint('mqtt','port')
keepalive = config.getint('mqtt','keepalive')

#database
db_name = config.get('database','db_name')
user_name = config.get('database','user_name')
pword = config.get('database','password')
host_ip = config.get('server','host')
port_num = config.get('server','port')

topics = ["mistral/Ambient-Light","mistral/Co2","mistral/Level","mistral/Pressure","mistral/Temperature"]
#sensor_list = ["temperature","pressure","co2","level","ambient"]
#mac_list = [[],[],[],[],[]]

mac_sensor_dict = {}

def db_connect():

	conn = psycopg2.connect(
		database = db_name,
		user = user_name,
		password = pword,
		host = host_ip,
		port = port_num
	)
	
	table_name = "device"
	conn.autocommit = True
	cursor = conn.cursor()
	
	sql = "select * from %s where status='1'" % (table_name)
	cursor.execute(sql)
	
	rows = cursor.fetchall()
	conn.close()
	cursor.close()
	return rows

def validate():
		rows = db_connect()
		device_list = []
		msg = ""
		error = 0
		if rows:
			msg = "success"
			error = 0
			for row in rows:
				failed_list = []
				device = collections.OrderedDict()
				device["device_id"] = row[0]
				device["device_name"] = row[1]
				device["mac_id"] = row[2]
				mac_id = row[2]
				
				if mac_id in mac_sensor_dict.keys():
					failed_list = mac_sensor_dict[mac_id]
					
				if (len(failed_list) == 0):
					device["sensor_status"] = 0
					device["sensor_msg"] = "All sensors are working!"
				else:
					device["sensor_status"] = 1
					if (len(failed_list) > 1):
						device["sensor_msg"] = ','.join(failed_list) + " sensors are having some issues!"
					else:
						device["sensor_msg"] = ','.join(failed_list) + " sensor is having some issues!"
				
				device_list.append(device)
				
			return json.dumps({'message':msg,'is_error':error,'devices':device_list})

def on_connect(client, userdata, rc, buf):
	print("Connected with result code "+str(rc))

	for topic in topics:
		client.subscribe(topic)

def on_message(client, userdata, msg):
	payload = json.loads(msg.payload)
	
	mac = payload["mac_id"]
	value = payload["value"]
	topic = msg.topic
	sensor = topic.split("/")
	sensor.pop(0)
	
	if (value == 0):
		if mac not in mac_sensor_dict.keys():
			mac_sensor_dict[mac] = sensor
			
		else:
			prev_list = mac_sensor_dict[mac]
			if sensor[0] not in prev_list:
				prev_list.append(sensor[0])
				mac_sensor_dict[mac] = prev_list
			
client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

client.connect(host_name, port, keepalive)
client.loop_start()
while True:
	data = validate()
	client.publish("mistral/health",data)
	time.sleep(10)


	
				
		

