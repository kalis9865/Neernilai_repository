import time,os
import random
import multiprocessing
import threading
import json
from datetime import datetime
import pytz

import paho.mqtt.client as mqtt
from db import db_wrapper

#setting timezone
tz_NY = pytz.timezone('Asia/Kolkata')

config_obj = db_wrapper.configure()
db_name,user_name,pword,host_ip,port_num,host_name,mqtt_port,keepalive = config_obj.config()

db_obj=db_wrapper.db(database=db_name,user=user_name,password=pword,host=host_ip,port=port_num)
table_obj = db_wrapper.table(db_obj)


mac_sensor_dict = {}
dev_dict = {}
sensor_dict = {}

def get_sensor():
	rows = table_obj.get_data("sensors")
	#print(f"rows-sensor value is {rows}")    
	if rows:
		for row in rows:
			if row[0] not in sensor_dict.keys():
				sensor_dict[row[0]] = row[1]
	print(f"sensor_dict value is {sensor_dict}")


def value_generator(sensor):
	values = [None]	* len(sensor)
	for s in sensor:
		if "Dissolved-O2" == s:
			i = sensor.index(s)
			values[i] = random.randint(90,98)

		elif "Dissolved-Solids" == s:
			i = sensor.index(s)
			values[i] = random.randint(350,400)

		elif "Humidity" == s:
			i = sensor.index(s)
			values[i] = random.randint(30,40)

		elif "pH" == s:
			values[sensor.index(s)] = random.randint(7,8)

		elif "Temperature" == s:
			values[sensor.index(s)] = random.randint(30,35)

		elif "Water-Level" == s:
			values[sensor.index(s)] = random.randint(30,35)

		elif "Water-Current" == s:
			values[sensor.index(s)] = random.randint(20,25)

		elif "Wind-Speed" == s:
			values[sensor.index(s)] = random.randint(15,20)

#	print(values)
	return values

def on_connect(client, userdata, rc, buf):
    print("Publisher connected with result code "+str(rc))

def publish(mac,sensor):
	#print("Debug >>>>>>>>>>>>>>>>>>>>>>>>>>>>> 1")
	sensor_db=db_wrapper.db(database='sensor_data',user=user_name,password=pword,host=host_ip,port=port_num)
	sensor_table = db_wrapper.table(sensor_db)

	values = value_generator(sensor)

	#print("Debug >>>>>>>>>>>>>>>>>>>>>>>>>>>>> 2")

	dev_id = 0
	sensor_ids = []
	for id, mac_id in dev_dict.items():
		if mac_id == mac:
			dev_id = id

	for id, name in sensor_dict.items():
		if name in sensor:
			sensor_ids.append(id)

	#print("Debug >>>>>>>>>>>>>>>>>>>>>>>>>>>>> 3", values)

	for topic,val,s_id in zip(sensor,values,sensor_ids):
		now = datetime.now(tz_NY)
		ts = time.mktime(now.timetuple())
		#if (topic == "Level"):
			#json_data = json.dumps({'device_id':dev_id,'mac_id':mac,'value':0})
			#client.publish("mistral/"+topic,json_data)
		#else:
		#msg=sensor_table.insert("logging_data",timestamp=ts,device_id=dev_id,sensor_id=s_id,value=val)
		# json_data = json.dumps({'device_id':dev_id,'mac_id':mac,'value':val})
		json_data = json.dumps({'device_id':dev_id,'mac_id':mac, 'sensor_id':s_id, 'value':val})
		#print(json_data)
		print(f"Topic: {topic}, json Data: {json_data}")
		client.publish("mistral/"+topic,json_data)

#thread function
def pub_data(mac,sensor):
	while True:
		publish(mac,sensor)
		time.sleep(5)

def get_device():
	existing_dict = mac_sensor_dict.copy()
	rows = table_obj.get_device("device")
	#print(f"rows-devices values is {rows}")

	if rows:
		for row in rows:
			ids = row[3]
			names = table_obj.get_sensors("sensor_name","sensor_id",ids)
			print(f"names values is {names}")
			if (row[0] not in dev_dict.keys()):
				dev_dict[row[0]] = row[2]

			if (row[2] not in mac_sensor_dict.keys()):
				mac_sensor_dict[row[2]] = names

			elif (names != mac_sensor_dict[row[2]]):
				mac_sensor_dict[row[2]] = names

	#print(f"mac_sensor_dict value is{mac_sensor_dict} and existing dict  value is {existing_dict}")
	final_dict = { k : mac_sensor_dict[k] for k in set(mac_sensor_dict) - set(existing_dict) }
	commonKeys = set(mac_sensor_dict) - (set(mac_sensor_dict) - set(existing_dict))
	# print(f"final_dict value is {final_dict}")
	# print(f"commone keys value is {commonKeys}")

	for key in commonKeys:
		if(mac_sensor_dict[key] != existing_dict[key]):
			final_dict[key] = mac_sensor_dict[key]

	keys = []
	values = []
	items = final_dict.items()
	for item in items:
		keys.append(item[0]), values.append(item[1])

	return keys,values

def db_thread():
	while True:
		mac_ids,sensors= get_device()
		print(f"mac_ids is {mac_ids} and sensors is{sensors}")
		get_sensor()
		for i in range(0,len(mac_ids)):
			try:
				processThread = multiprocessing.Process(target=pub_data, args=(mac_ids[i],sensors[i],))
				processThread.start()
			except:
				print("Error: unable to start thread")
		time.sleep(15)

#mqtt connection
print("testing")
client = mqtt.Client()
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
