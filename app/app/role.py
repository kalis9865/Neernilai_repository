import json
import os
import collections
from . import db_wrapper

filename = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'db_config.ini')
table_name = "role"

class role:

	config_obj = db_wrapper.configure()
	db_name,user_name,pword,host_ip,port_num = config_obj.config(filename)
	
	db_obj=db_wrapper.db(database=db_name,user=user_name,password=pword,host=host_ip,port=port_num)
	table_obj = db_wrapper.table(db_obj,table_name)

	msg = ""
	error = 0
	
	def get_role(self):
		rows = self.table_obj.get_data("role_id")
		
		role_list=[]
		if rows:
			self.msg = "Data fetched successfully"
			self.error = 0
			for row in rows:
				role = collections.OrderedDict()
				role["role_id"] = row[0]
				role["role_name"] = row[1]
				
				role_list.append(role)
			
			role_list.reverse()
			return json.dumps({'message':self.msg,'is_error':self.error,'roles':role_list})
		else:
			self.msg = "No role found"
			self.error = 1
			return json.dumps({'message':self.msg,'is_error':self.error})
	
	
	def main_role(self,req):
		action = req.POST['action']
		
		if (action == "get"):
			get_res = self.get_role()
			return get_res