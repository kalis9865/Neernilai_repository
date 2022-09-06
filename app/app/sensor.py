import json
import collections
import os
from . import db_wrapper

filename = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'db_config.ini')
table_name = "sensors"

class sensor():
	config_obj = db_wrapper.configure()
	db_name,user_name,pword,host_ip,port_num = config_obj.config(filename)
	
	db_obj=db_wrapper.db(database=db_name,user=user_name,password=pword,host=host_ip,port=port_num)
	table_obj = db_wrapper.table(db_obj,table_name)

	msg = ""
	error = 0
	
	def get_sensor(self):
		rows = self.table_obj.get_data("sensor_id");
		sensor_list = []
		if rows:
			self.msg = "Data fetched successfully"
			self.error = 0
			
			for row in rows:
				sensor = collections.OrderedDict()
				sensor["id"] = row[0]
				sensor["name"] = row[1]
				
				sensor_list.append(sensor)
			
			sensor_list.reverse()
			return json.dumps({'message':self.msg,'is_error':self.error,'sensors':sensor_list})
			
		else:
			self.msg = "No data found"
			self.error = 1
			return json.dumps({'message':self.msg,'is_error':self.error})
	
	def get_item(self,column,value):
		row = self.table_obj.get_item(column,value)
		if row:
			self.msg = "Data fetched successfully"
			self.error = 0
			
			return json.dumps({'message':self.msg,'is_error':self.error,'sensor':row[0]})
			
		else:
			self.msg = "No data found"
			self.error = 1
			return json.dumps({'message':self.msg,'is_error':self.error})
			
	def main_sensor(self,req):
		action = req.POST['action']
		
		if (action == 'get'):
			get_res = self.get_sensor()
			return get_res
			
		elif (action == 'get_item'):
			value = req.POST['sensor_id']
			column = "sensor_id"
			get_item_res = self.get_item(column,value)
			
			return get_item_res
			
		else:
			return "Action not found"
			
