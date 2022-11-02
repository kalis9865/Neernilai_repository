import json
import collections
import os
from . import db_wrapper

filename = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'db_config.ini')
table_name = "device"

class device():

	config_obj = db_wrapper.configure()
	db_name,user_name,pword,host_ip,port_num = config_obj.config(filename)
	
	db_obj=db_wrapper.db(database=db_name,user=user_name,password=pword,host=host_ip,port=port_num)
	table_obj = db_wrapper.table(db_obj,table_name)

	msg = ""
	error = 0

	def add_device(self,dev_name,mac,id,desc,stat):
		message = self.table_obj.insert(device_name=dev_name,mac_id=mac,sensor_ids=id,description=desc,status=stat)
		if (message == "success"):
			self.msg = message
			self.error = 0
		else:
			self.msg = "Device already exits! Try with different DeviceName and MacId"
			self.error = 1

	def get_device(self):
		rows = self.table_obj.get_data("device_id")
		
		device_list = []
		if rows:
			self.msg = "Data fetched successfully"
			self.error = 0
			for row in rows:
				ids = row[3]
				names = self.table_obj.get_sensors("sensor_name","sensor_id",ids)
				
				device = collections.OrderedDict()
				device["device_id"] = row[0]
				device["device_name"] = row[1]
				device["mac_id"] = row[2]
				device["sensors"] = names
				device["description"] = row[4]
				device["status"] = row[5]

				device_list.append(device)

			return json.dumps({'message':self.msg,'is_error':self.error,'devices':device_list})
		else:
			self.msg = "No device found"
			self.error = 1
			return json.dumps({'message':self.msg,'is_error':self.error})

	def get_item(self,column,value):
		row = self.table_obj.get_item(column,value)
		print("entered get_item", flush=True)
		if row:
			self.msg = "Data fetched successfully"
			self.error = 0
			
			ids = row[3]
			names = self.table_obj.get_sensors("sensor_name","sensor_id",ids)
			sensor_list = []
			if names:
				for i in range(0,len(names)):
					s_info= collections.OrderedDict()
					s_info["id"] = ids[i]
					s_info["name"] = names[i]
					
					sensor_list.append(s_info)
			
			device = collections.OrderedDict()
			device["device_id"] = row[0]
			device["device_name"] = row[1]
			device["mac_id"] = row[2]
			device["sensors"] = sensor_list
			device["description"] = row[4]
			#device["status"] = row[5]
			print(f"return device value is {device}", flush=True)
			return device
		else:
			self.msg = "Device id not found"
			self.error = 1
			return self.error
	
	def get_stat(self,column,value):
		rows = self.table_obj.get_stat_item(column,value)
		
		device_list = []
		if rows:
			self.msg = "Data fetched successfully"
			self.error = 0
			for row in rows:
				ids = row[3]
				names = self.table_obj.get_sensors("sensor_name","sensor_id",ids)
				
				device = collections.OrderedDict()
				device["device_id"] = row[0]
				device["device_name"] = row[1]
				device["mac_id"] = row[2]
				device["sensors"] = names
				device["description"] = row[4]
				device["status"] = row[5]

				device_list.append(device)

			return json.dumps({'message':self.msg,'is_error':self.error,'devices':device_list})
		else:
			self.msg = "No device found"
			self.error = 1
			return json.dumps({'message':self.msg,'is_error':self.error})
	
	
	def delete_device(self,column,value):
		count = self.table_obj.delete_item(column,value)
		if count:
			self.msg = "success"
			self.error = 0
		else:
			self.msg = "failure"
			self.error = 1

	def update_device(self,dev_id,dev_name,mac,sensor_ids,desc):
		count = self.table_obj.update_item(device_id=dev_id,device_name=dev_name,mac_id=mac,sensor_ids=sensor_ids,description=desc)
		if count:
			self.msg = "success"
			self.error = 0
		else:
			self.msg = "failure"
			self.error = 1
			
	def update_status(self,dev_id,stat):
		count = self.table_obj.update_item(device_id=dev_id,status=stat)
		if count:
			self.msg = "success"
			self.error = 0
		else:
			self.msg = "failure"
			self.error = 1
			
	def get_dev_sensor(self):
		rows = self.table_obj.get_sensor();
		sensor_list = []
		if rows:
			self.msg = "Data fetched successfully"
			self.error = 0
			
			for row in rows:
				sensor = collections.OrderedDict()
				sensor["id"] = row[0]
				sensor["name"] = row[1]
				
				sensor_list.append(sensor)
				
			return sensor_list
			
		else:
			self.msg = "No data found"
			self.error = 1
			return self.error
			
	def main_device(self,req):
		action = req.POST['action']

		if (action == 'add'):
			dev_name = req.POST['device_name']
			mac_id = req.POST['mac_id']
			sensor_ids = req.POST['sensor_id']
			description = req.POST['description']
			status = '1'

			self.add_device(dev_name,mac_id,sensor_ids,description,status)
			add_res = json.dumps({'message':self.msg,'is_error':self.error})
			return add_res

		elif (action == 'get'):
			get_res = self.get_device()
			return get_res
			
		elif (action == 'get_item'):
			value = req.POST['device_id']
			column = "device_id"
			device = self.get_item(column,value)
			if (self.error == 0):
				return json.dumps({'message':self.msg,'is_error':self.error,'device':device})
				
			else:
				return json.dumps({'message':self.msg,'is_error':self.error})
			
		elif (action == 'get_stat'):
			value = 1
			column = "status"
			get_item_res = self.get_stat(column,value)
			return get_item_res
			
		elif (action == 'delete'):
			value = req.POST['device_name']
			column = "device_name"
			self.delete_device(column,value)
			delete_res = json.dumps({'message':self.msg,'is_error':self.error})
			return delete_res

		elif (action == 'update'):
			dev_id = req.POST['device_id']
			dev_name = req.POST['device_name']
			mac_id = req.POST['mac_id']
			sensor_ids = req.POST['sensor_id']
			description = req.POST['description']
			
			self.update_device(dev_id,dev_name,mac_id,sensor_ids,description)
			update_res = json.dumps({'message':self.msg,'is_error':self.error})
			return update_res

		elif (action == 'update_status'):
			dev_id = req.POST['device_id']
			status = req.POST['device_status']
			
			self.update_status(dev_id,status)
			update_res = json.dumps({'message':self.msg,'is_error':self.error})
			return update_res
			
		elif (action == 'get_dev_sensors'):
			dev_id = req.POST['device_id']
			column = "device_id"
			device = self.get_item(column,dev_id)
			sensor = self.get_dev_sensor()
			return json.dumps({'message':self.msg,'is_error':self.error,'sensor':sensor,'device':device})
			
		else:
			self.msg = "action not found"
			return self.msg
