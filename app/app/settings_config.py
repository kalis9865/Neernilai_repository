import configparser
import os
import json

class Settings:
	
	filename = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'settings.conf')
	config = configparser.ConfigParser()
	config.read(filename)
	
	msg = ""
	error = 0
	def read(self):
		idle_time = self.config.getint('settings','timeout')
		db_time = self.config.getint('settings','logging_time')
		pub_time = self.config.getint('settings','publish_time')
		
		return json.dumps({'idle_timeout':idle_time,'database_logging':db_time,'publish_time':pub_time})
		
	def update(self,field,value):
		obj = self.config['settings']
		obj[field] = value
		
		with open(self.filename, 'w') as conf:
			self.config.write(conf)
	
		msg = "success"
		error = 0
		return json.dumps({'message':msg,'is_error':error})
	
	def main_settings(self,req):
		action = req.POST['action']
		
		if (action == "update"):
			field = req.POST['field']
			value = req.POST['value']
			
			return self.update(field,value)
			
		elif (action == "read"):
			res_data = self.read()
			return res_data