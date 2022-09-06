import json
import os
import smtplib
import email.utils
import boto3
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from configparser import ConfigParser

from . import db_wrapper

filename = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'db_config.ini')
settings_filename = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'settings.conf')
table_name = "iotuser"

class forgot:

	config_obj = db_wrapper.configure()
	db_name,user_name,pword,host_ip,port_num = config_obj.config(filename)
	
	smtp_config = ConfigParser()
	smtp_config.read(settings_filename)
	sender_mail = smtp_config.get('smtp','sender_mail')
	username_smtp = smtp_config.get('smtp','username_smtp')
	password_smtp = smtp_config.get('smtp','password_smtp')
	host = smtp_config.get('smtp','host')
	port = smtp_config.get('smtp','port')
	
	access_id = smtp_config.get('accesskey','aws_access_key_id')
	access_key = smtp_config.get('accesskey','aws_secret_access_key')
	name_of_region = smtp_config.get('accesskey','region_name')
	
	db_obj=db_wrapper.db(database=db_name,user=user_name,password=pword,host=host_ip,port=port_num)
	table_obj = db_wrapper.table(db_obj,table_name)

	msg = ""
	error = 0
	
	def reset(self,username,mail_id):
		row = self.table_obj.user_email_validation('user_name',username,'email',mail_id)
		if row:
			username = row[1]
			password = row[2]
			
			#sending mail
			SENDER = self.sender_mail
			SENDERNAME = 'Cloud View'
			RECIPIENT  = mail_id
			
			USERNAME_SMTP = self.username_smtp
			PASSWORD_SMTP = self.password_smtp
			HOST = self.host
			PORT = self.port
			
			SUBJECT = 'Forgot Password'
			
			# The email body for recipients with non-HTML email clients.
			BODY_TEXT = ("Hi "+ username + "\r\n"
						"Username: " +username + "\r\n"
						"Password: "+ password)

			# The HTML body of the email.
			BODY_HTML = '''<html>
			<head></head>
			<body>
			  <p>Hi {user},</p>
			  <p>User name: {user_name}</p>
			  <p>Password: {pass_word}</p>
			</body>
			</html>'''.format(user=username,user_name=username,pass_word=password)
						
			# Create message container - the correct MIME type is multipart/alternative.
			msg = MIMEMultipart('alternative')
			msg['Subject'] = SUBJECT
			msg['From'] = email.utils.formataddr((SENDERNAME, SENDER))
			msg['To'] = RECIPIENT
			# Comment or delete the next line if you are not using a configuration set
			#msg.add_header('X-SES-CONFIGURATION-SET',CONFIGURATION_SET)

			# Record the MIME types of both parts - text/plain and text/html.
			part1 = MIMEText(BODY_TEXT, 'plain')
			part2 = MIMEText(BODY_HTML, 'html')
			
			# Attach parts into message container.
			msg.attach(part1)
			msg.attach(part2)
			
			try:  
				server = smtplib.SMTP(HOST, PORT)
				server.ehlo()
				server.starttls()
				#stmplib docs recommend calling ehlo() before & after starttls()
				server.ehlo()
				server.login(USERNAME_SMTP, PASSWORD_SMTP)
				server.sendmail(SENDER, RECIPIENT, msg.as_string())
				server.close()
			# Display an error message if something goes wrong.
			except Exception as e:
				self.msg = "Your Mail id is not verified"
				self.error = 1
				return json.dumps({'message':self.msg,'is_error':self.error,'verified':0})
			else:
				self.msg = "success"
				return json.dumps({'message':self.msg,'is_error':self.error,'verified':1})
				
		else:
			self.msg = "Email id does not match with your username"
			self.error = 1
			return json.dumps({'message':self.msg,'is_error':self.error,'verified':1})
			
			
	def verify_email(self,username,mail_id):
		row = self.table_obj.user_email_validation('user_name',username,'email',mail_id)
		if row:
			# Create SES client
			ses = boto3.client('ses',aws_access_key_id=self.access_id,aws_secret_access_key=self.access_key,region_name=self.name_of_region)

			response = ses.verify_email_identity(
			  EmailAddress = mail_id
			)
			
			self.msg = "Verification request send to your mail."
			self.error = 0
			return json.dumps({'message':self.msg,'is_error':self.error})
			
		else:
			self.msg = "Email id does not match with your username"
			self.error = 1
			return json.dumps({'message':self.msg,'is_error':self.error})
		
			
	def main_forgot(self,req):
		action = req.POST['action']
		
		if (action == "reset"):
			username = req.POST['username']
			mail_id = req.POST['mail_id']
			res_data = self.reset(username,mail_id)
			return res_data
			
		elif (action == "verify_email"):
			username = req.POST['username']
			mail_id = req.POST['mail_id']
			
			res_data = self.verify_email(username,mail_id)
			return res_data
			