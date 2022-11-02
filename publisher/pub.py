import time,os
import random
import multiprocessing
import threading
import json
from datetime import datetime
import pytz
# import serial
import paho.mqtt.client as mqtt
from db import db_wrapper
import collections
import csv
from configparser import ConfigParser

#setting timezone
tz_NY = pytz.timezone('Asia/Kolkata')

config_obj = db_wrapper.configure()
db_name,user_name,pword,host_ip,port_num,host_name,mqtt_port,keepalive = config_obj.config()

db_obj=db_wrapper.db(database=db_name,user=user_name,password=pword,host=host_ip,port=port_num)
table_obj = db_wrapper.table(db_obj)


mac_sensor_dict = {}
dev_dict = {}
sensor_ids = {}
board_sensor_data = {}

def get_sensor():
	rows = table_obj.get_data("sensors")	 
	if rows:
		for row in rows:			
			sensor_ids[row[1]] = row[0]
	print(f"sensor_ids value is {sensor_ids}")   

# def get_device_data():
					
# 	ser = serial.Serial('/dev/ttyACM0', 230400) #timeout=2)
# 	data = ser.readline().decode().strip()
# 	f_data  = json.loads(data)			
# 	return f_data

# def value_generator(sensors):

# 	device_data = get_device_data()
# 	values = [None]	* len(sensors)
# 	for sensor in sensors:
# 		if "Dissolved-Solids" == sensor:
# 			i = sensors.index(sensor)
# 			values[i] = random.randint(30,35)

# 		elif "Humidity" == sensor:
# 			i = sensors.index(sensor)
# 			values[i] = device_data["hum"]

# 		elif "pH" == sensor:
# 			values[sensors.index(sensor)] = device_data["phv"]

# 		elif "Temperature" == sensor:
# 			values[sensors.index(sensor)] =device_data["tempc"]

# 		elif "Water-Level" == sensor:
# 			values[sensors.index(sensor)] = random.randint(30,35)

# 		elif "Dissolved-O2" == sensor:
# 			values[sensors.index(sensor)] = device_data["tur"]
# 	return values

def value_generator(sensors):

	# device_data = get_device_data()
	values = [None]	* len(sensors)

	for sensor in sensors:
		if "Dissolved-Solids" == sensor:
			i = sensors.index(sensor)
			values[i] = random.randint(30,35)

		elif "Humidity" == sensor:
			i = sensors.index(sensor)
			values[i] = random.randint(30,35)

		elif "pH" == sensor:
			values[sensors.index(sensor)] = random.randint(30,35)

		elif "Temperature" == sensor:
			values[sensors.index(sensor)] =random.randint(30,35)

		elif "Water-Level" == sensor:
			values[sensors.index(sensor)] = random.randint(30,35)

		elif "Dissolved-O2" == sensor:
			values[sensors.index(sensor)] = random.randint(30,35)
	
	print(f"values is {values}")
	return values

def on_connect(client, userdata, rc, buf):
    print("Publisher connected with result code "+str(rc))

def publish(mac,sensors):

	values = value_generator(sensors)
	
	for sensor, value in zip(sensors, values) :
		now = datetime.now(tz_NY)
		ts = time.mktime(now.timetuple())
		json_data = json.dumps({'mac_id':mac, 'sensor_id':sensor_ids[sensor], 'value':value})
		#print(json_data)	
		print(f"Topic: {sensor}, json Data: {json_data}")
		client.publish("mistral/"+sensor,json_data)

#thread function
def pub_data(mac, sensors):
	while True:		
		print("entered publish data")
		publish(mac,sensors)		
		time.sleep(1)
	
def db_thread():

	existing_mac = ""
	mac_id = ""	
	get_sensor()
	existing_mac = mac_id
	config = ConfigParser()
	config.read("config.ini")
	mac_id = config.get('device', 'device_name')
	value = config.get('device', 'sensors')
	sensor_list = list(value.split(','))
	print(f"sensor_list is {sensor_list}")
	if existing_mac != mac_id:
		try:			
			processThread = multiprocessing.Process(target=pub_data, args=(mac_id, sensor_list))
			processThread.start()			
		except:
			print("Error: unable to start thread")	
		# time.sleep(15)

#mqtt connection
print("testing")
client = mqtt.Client(clean_session=True)
client.on_connect = on_connect
client.connect(host_name, mqtt_port, keepalive)

#starting thread
try:
	print("starting db thread")
	dbThread = threading.Thread(target=db_thread)
	dbThread.start()
except:
	print("Error: unable to start db thread")

while True:
    pass
