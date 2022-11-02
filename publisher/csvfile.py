import serial
import csv
import time
import json
import multiprocessing

#{'tds': 0, 'env': 27, 'hum': 51, 'tur': 92, 'tempc': 27, 'tempf': 80.6, 'phv': 4.332275}
def get_device_data():
	retry = 1
	max_retry = 4
	data = None
	file_name =  "sensor_value.csv"

	while True:
		while retry <= max_retry:
			values = []		
			ser = serial.Serial('/dev/ttyACM0', 230400) #timeout=2)
			data = ser.readline().decode().strip()
			f_data  = json.loads(data)			
			file = open(file_name, 'w+')
			writer = csv.writer(file)
			for k,v in f_data.items():
				writer.writerow([k,v])
			break	
		
	
def test():
	time.sleep(15)
	file_name =  "sensor_value.csv"
	ouput =None
	values = None
	sensor_values = {}
	while True:		
		with open(file_name, 'r') as f:
			reader = csv.reader(f)
			ouput = list(reader)
		
		
		if ouput:
			for value in ouput:
				sensor_values[value[0]] = float(value[1])


		print(f"sensor_values is {sensor_values}")



processThread = multiprocessing.Process(target=get_device_data)
processThread.start()


processThread2 = multiprocessing.Process(target=test)
processThread2.start()