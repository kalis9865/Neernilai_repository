import json
import collections
import os
from . import db_wrapper

filename = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'db_config.ini')
table_name = "dashboard"

class dashboard():

	config_obj = db_wrapper.configure()
	db_name,user_name,pword,host_ip,port_num = config_obj.config(filename)
	
	db_obj=db_wrapper.db(database=db_name,user=user_name,password=pword,host=host_ip,port=port_num)
	table_obj = db_wrapper.table(db_obj,table_name)

	msg = ""
	error = 0
	
	def add_dashboard(self,name,s_info,grid_layout):
		message = self.table_obj.insert(dashboard_name=name,sensor_info=s_info,layout=grid_layout)
		if (message == "success"):
			self.msg = message
			self.error = 0
		else:
			self.msg = "Dashboard already exits! Try with different Dashboard Name"
			self.error = 1

	def get_dashboard(self):
		rows = self.table_obj.get_data("dashboard_id")
		dashboard_list = []
		if rows:
			self.msg = "Data fetched successfully"
			self.error = 0
			for row in rows:
				dashboard = collections.OrderedDict()
				dashboard["dashboard_id"] = row[0]
				dashboard["dashboard_name"] = row[1]
				dashboard["sensor_info"] = row[2]
				dashboard["layout"] = row[3]
				
				dashboard_list.append(dashboard)

			return json.dumps({'message':self.msg,'is_error':self.error,'dashboards':dashboard_list})
		else:
			self.msg = "No dashboard found"
			self.error = 1
			return json.dumps({'message':self.msg,'is_error':self.error})
			
	def get_item(self,column,value):
		row = self.table_obj.get_item(column,value)
		if row:
			self.msg = "Data fetched successfully"
			self.error = 0
			
			dashboard = collections.OrderedDict()
			dashboard["dashboard_id"] = row[0]
			dashboard["dashboard_name"] = row[1]
			dashboard["sensor_info"] = row[2]
			dashboard["layout"] = row[3]
			
			return json.dumps({'message':self.msg,'is_error':self.error,'dashboard':dashboard})
		else:
			self.msg = "Dashboard id not found"
			self.error = 1
			return json.dumps({'message':self.msg,'is_error':self.error})
			
	def delete_dashboard(self,column,value):
		count = self.table_obj.delete_item(column,value)
		if count:
			self.msg = "success"
			self.error = 0
		else:
			self.msg = "failure"
			self.error = 1

	def update_dashboard(self,id,name,s_info,grid_layout):
		count = self.table_obj.update_item(dashboard_id=id,dashboard_name=name,sensor_info=s_info,layout=grid_layout)
		if count:
			self.msg = "success"
			self.error = 0
		else:
			self.msg = "failure"
			self.error = 1
	
	#main function
	def main_dashboard(self,req):
		action = req.POST['action']
		
		if (action == 'add'):
			dashboard_name = req.POST['dashboard_name']
			sensor_info = req.POST['sensor_info']
			layout = req.POST['layout']

			self.add_dashboard(dashboard_name,sensor_info,layout)
			add_res = json.dumps({'message':self.msg,'is_error':self.error})
			return add_res

		elif (action == 'get'):
			get_res = self.get_dashboard()
			return get_res
			
		elif (action == 'get_item'):
			value = req.POST['dashboard_id']
			column = "dashboard_id"
			get_item_res = self.get_item(column,value)
			return get_item_res

		elif (action == 'delete'):
			col_name = "dashboard_name"
			value = req.POST['dashboard_name']
			self.delete_dashboard(col_name,value)
			delete_res = json.dumps({'message':self.msg,'is_error':self.error})
			return delete_res

		elif (action == 'update'):
			dashboard_id = req.POST['dashboard_id']
			dashboard_name = req.POST['dashboard_name']
			sensor_info = req.POST['sensor_info']
			layout = req.POST['layout']

			self.update_dashboard(dashboard_id,dashboard_name,sensor_info,layout)
			update_res = json.dumps({'message':self.msg,'is_error':self.error})
			return update_res

		else:
			self.msg = "action not found"
			return self.msg

