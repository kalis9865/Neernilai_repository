import psycopg2
import json
from configparser import ConfigParser

class table:

	error_msg= ""
	
	def __init__(self,db):
		self.db = db
		self.db_cursor = None

	def _new_cursor(self):
		#ensure we have a fresh, working cursor
		if self.db_cursor:
			self.db_cursor.close()
		self.db_cursor = self.db.obj.cursor()

	def _query(self,q,data=None):
		if not self.db_cursor:
			self._new_cursor()
		try:
			self.db_cursor.execute(q,data)
		except psycopg2.Error as e:
			self.error_msg = str(e)

	def get_device(self,name):
		q = "select * from %s where status='1'" % (name)
		self._query(q)
		return self.db_cursor.fetchall()
		
	def get_data(self,name):
		q= "select * from %s" % (name)
		self._query(q)
		return self.db_cursor.fetchall()
		
	def get_sensors(self,column,column1,values):
		ids = []
		for value in values:
			q = "select %s from sensors where %s='%s'" % (column,column1,value)
			self._query(q)
			value = self.db_cursor.fetchone()
			ids.append(value[0])
		return ids
		
	def insert(self,name,**kwargs):
		columns = []
		values =[]
		for column,value in kwargs.items():
			columns.append(column)
			values.append(value)

		fmt1 = ("%s," *len(values))[:-1]
		q = "insert into %s(%s) values (%s)" % (name,', '.join(columns),fmt1)
		self._query(q, values)
		if (self.db_cursor.rowcount == 1):
			return "success"
		else:
			return self.error_msg
		
class db:

	def  __init__(self,**kwargs):
		if kwargs:
			self.connect(**kwargs)

	def connect(self,**kwargs):
		self.obj = psycopg2.connect(**kwargs)
		self.obj.autocommit = True
		
class configure:
	
	def config(self):
		config = ConfigParser()
		config.read("config.ini")

		#mqtt
		host_name = config.get('mqtt','host_name')
		mqtt_port = config.getint('mqtt','port')
		keepalive = config.getint('mqtt','keepalive')
		
		db_name = config.get('database','db_name')
		user_name = config.get('database','user_name')
		pword = config.get('database','password')
		host_ip = config.get('server','host')
		port_num = config.get('server','port')
		
		return db_name,user_name,pword,host_ip,port_num,host_name,mqtt_port,keepalive
