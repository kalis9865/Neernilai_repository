import json
import collections
import os
from . import db_wrapper

filename = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'db_config.ini')
table_name = "widget"

class widget():
	config_obj = db_wrapper.configure()
	db_name,user_name,pword,host_ip,port_num = config_obj.config(filename)
	
	db_obj=db_wrapper.db(database=db_name,user=user_name,password=pword,host=host_ip,port=port_num)
	table_obj = db_wrapper.table(db_obj,table_name)
	
	msg =""
	error = 0
	def get_widget(self,column,value):
		types,ids = self.table_obj.get_widgetinfo(column,value)
		msg = "success"
		error = 0
		info_list =[]
		for i in range(0,len(ids)):
			info= collections.OrderedDict()
			info["id"] = ids[i]
			info["type"] = types[i]
			
			info_list.append(info)
			
		res_data = json.dumps({"message": msg,"is_error": error,"info": info_list})
		
		return res_data
		
	def main_widget(self,req):
		action = req.POST['action']

		if (action == 'get_widget'):
			value = req.POST['sensor_id']
			column = "id"
			get_res = self.get_widget(column,value)
			return get_res
			
		else:
			return "action not found"
		