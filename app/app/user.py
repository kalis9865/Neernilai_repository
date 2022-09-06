import json
import os
import collections
import boto3
from configparser import ConfigParser

from . import db_wrapper

filename = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'db_config.ini')
settings_filename = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'settings.conf')
table_name = "iotuser"

class user:

	config_obj = db_wrapper.configure()
	db_name,user_name,pword,host_ip,port_num = config_obj.config(filename)
	
	creds_config = ConfigParser()
	creds_config.read(settings_filename)
	access_id = creds_config.get('accesskey','aws_access_key_id')
	access_key = creds_config.get('accesskey','aws_secret_access_key')
	name_of_region = creds_config.get('accesskey','region_name')
	
	db_obj=db_wrapper.db(database=db_name,user=user_name,password=pword,host=host_ip,port=port_num)
	table_obj = db_wrapper.table(db_obj,table_name)

	msg = ""
	error = 0

	def login(self,username,password):
		row = self.table_obj.login_validation(username)
		if row:
			if(row[0] == password):
				if ((row[1] == True) or (row[1] == 1) or (row[1] == 't')):
					self.msg = "success"
				else:
					self.msg = "Your Account is disabled by Admin"
					self.error = 1
			else:
				self.msg = "Incorrect password"
				self.error = 1
		else:
			self.msg = "Incorrect user credentials"
			self.error = 1

		return self.msg,self.error
		
	def get_user(self):
		rows = self.table_obj.get_data("user_id")
		
		user_list = []
		if rows:
			self.msg = "Data fetched successfully"
			self.error = 0
			for row in rows:
				
				user = collections.OrderedDict()
				user["user_id"] = row[0]
				user["user_name"] = row[1]
				user["mail_id"] = row[3]
				if (row[4] == 1):
					user["role"] = "Admin"
				else:
					user["role"] = "User"
				user["status"] = row[5]
				user["mail_status"] = row[6]

				user_list.append(user)

			return json.dumps({'message':self.msg,'is_error':self.error,'users':user_list})
		else:
			self.msg = "No user found"
			self.error = 1
			return json.dumps({'message':self.msg,'is_error':self.error})

	def add_user(self,u_name,pword,mail_id,user_role,stat):
		message = self.table_obj.insert(user_name=u_name,password=pword,email=mail_id,role=user_role,status=stat,mail_status="Pending")
		if (message == "success"):
			self.msg = message
			self.error = 0
		else:
			self.msg = "User already exits! Try with different UserName and Mail_Id"
			self.error = 1
			
	def get_item(self,column,value):
		row = self.table_obj.get_item(column,value)
		if row:
			self.msg = "Data fetched successfully"
			self.error = 0
		
			user = collections.OrderedDict()
			user["user_id"] = row[0]
			user["user_name"] = row[1]
			user["password"] = row[2]
			user["mail_id"] = row[3]
			if (row[4] == 1):
				user["role"] = "Admin"
			else:
				user["role"] = "User"
			
			return user
		else:
			self.msg = "user id not found"
			self.error = 1
			return self.error
	
	def update_user(self,u_id,u_name,pword,mail_id,user_role):
		count = self.table_obj.update_item(user_id=u_id,user_name=u_name,password=pword,email=mail_id,role=user_role)
		if count:
			self.msg = "success"
			self.error = 0
		else:
			self.msg = "failure"
			self.error = 1
		
	def update_psw(self,u_name,pass_word):
		count = self.table_obj.update_item(user_name=u_name,password=pass_word)
		if count:
			self.msg = "success"
			self.error = 0
		else:
			self.msg = "failure"
			self.error = 1
			
	def update_status(self,u_id,stat):
		count = self.table_obj.update_item(user_id=u_id,status=stat)
		if count:
			self.msg = "success"
			self.error = 0
		else:
			self.msg = "failure"
			self.error = 1
			
	def delete_user(self,column,value):
		count = self.table_obj.delete_item(column,value)
		if count:
			self.msg = "success"
			self.error = 0
		else:
			self.msg = "failure"
			self.error = 1
			
	def verify_email(self,mail_id):
		# Create SES client
		ses = boto3.client('ses',aws_access_key_id=self.access_id,aws_secret_access_key=self.access_key,region_name=self.name_of_region)

		response = ses.verify_email_identity(
		  EmailAddress = mail_id
		)
		
		return "verification request send to your mail."
		
	def get_verificationStatus(self):
		rows = self.table_obj.get_data("user_id")
		
		if rows:
			mail_ids = []
			for row in rows:
				mail_ids.append(row[3])
			
			ses = boto3.client('ses',aws_access_key_id=self.access_id,aws_secret_access_key=self.access_key,region_name=self.name_of_region)
			
			response = ses.get_identity_verification_attributes(Identities=mail_ids)
			obj = json.dumps(response,indent=4)
			
			result = json.loads(obj)
			status = result.get("VerificationAttributes")

			for mail_id in mail_ids:
				stat = (status.get(mail_id)).get("VerificationStatus")
				if (stat == "Success"):
					stat = "Verified"
				self.table_obj.update_item(email=mail_id,mail_status=stat)
				
			return 1
		else:
			return 0
			
			
	def main_user(self,req):
		action = req.POST['action']
	
		if (action == "login"):
			user_name = req.POST['username']
			password = req.POST['password']
			self.msg,self.error = self.login(user_name,password)
			if (self.msg == "success"):
				req.session['username'] = user_name
				
			login_res = json.dumps({'message':self.msg,'is_error':self.error})
			return login_res

		elif(action == "get"):
			ret = self.get_verificationStatus()
			if (ret == 1):
				get_res = self.get_user()
				return get_res
			
		elif (action == "add"):
			user_name = req.POST['user_name']
			password = req.POST['pass_word']
			mail_id = req.POST['mail_id']
			role = req.POST['role']
			status = '1'
		
			self.add_user(user_name,password,mail_id,role,status)
			if (self.error == 0):
				verify_msg = self.verify_email(mail_id)
				add_res = json.dumps({'message':self.msg,'is_error':self.error,'verify_message':verify_msg})
			else:
				add_res = json.dumps({'message':self.msg,'is_error':self.error})
				
			return add_res
			
		elif (action == "get_item"):
			value = req.POST['value']
			column = req.POST['field']
			user = self.get_item(column,value)
			if (self.error == 0):
				return json.dumps({'message':self.msg,'is_error':self.error,'user':user})
				
			else:
				return json.dumps({'message':self.msg,'is_error':self.error})
			
		elif (action == 'update'):
			user_id = req.POST['user_id']
			user_name = req.POST['user_name']
			password = req.POST['pass_word']
			mail_id = req.POST['mail_id']
			role = req.POST['role']
			
			self.update_user(user_id,user_name,password,mail_id,role)
			update_res = json.dumps({'message':self.msg,'is_error':self.error})
			return update_res
			
		elif (action == "update_psw"):
			user_name = req.POST['user_name']
			password = req.POST['pass_word']
			
			self.update_psw(user_name,password)
			update_res = json.dumps({'message':self.msg,'is_error':self.error})
			return update_res
			
		elif (action == "update_status"):
			user_id = req.POST['user_id']
			status = req.POST['user_status']
			
			self.update_status(user_id,status)
			update_res = json.dumps({'message':self.msg,'is_error':self.error})
			return update_res
			
		elif (action == 'delete'):
			value = req.POST['user_name']
			column = "user_name"
			self.delete_user(column,value)
			delete_res = json.dumps({'message':self.msg,'is_error':self.error})
			return delete_res
