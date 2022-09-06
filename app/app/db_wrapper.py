import psycopg2
import json
from configparser import ConfigParser

class table:

	error_msg= ""
	
	def __init__(self,db,name):
		self.db = db
		self.name = name
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

	def login_validation(self,username):
		q = "select password,status from %s where user_name='%s'" % (self.name,username)
		self._query(q)
		return self.db_cursor.fetchone()

	def get_data(self,column):
		q = "select * from %s order by %s DESC" % (self.name,column)
		self._query(q)
		return self.db_cursor.fetchall()
		
	def get_item(self,column,value):
		q = "select * from %s where %s='%s'" % (self.name,column,value)
		self._query(q)
		return self.db_cursor.fetchone()

	def user_email_validation(self,column1,value1,column2,value2):
		q = "select * from %s where %s='%s' and %s='%s'" % (self.name,column1,value1,column2,value2)
		self._query(q)
		return self.db_cursor.fetchone()
		
	def get_stat_item(self,column,value):
		q = "select * from %s where %s='%s'" % (self.name,column,value)
		self._query(q)
		return self.db_cursor.fetchall()
		
	def insert(self,**kwargs):
		columns = []
		values =[]
		for column,value in kwargs.items():
			columns.append(column)
			values.append(value)

		fmt1 = ("%s," *len(values))[:-1]
		q = "insert into %s(%s) values (%s)" % (self.name,', '.join(columns),fmt1)
		self._query(q, values)
		if (self.db_cursor.rowcount == 1):
			return "success"
		else:
			return self.error_msg

	def delete_items(self):
		q = "delete from %s" % (self.name)
		self._query(q)

	def delete_item(self,column,value):
		q = "delete from %s where %s='%s'" % (self.name,column,value)
		self._query(q)
		return self.db_cursor.rowcount

	def update_item(self,**kwargs):
		columns = []
		values =[]
		for column,value in kwargs.items():
			columns.append(column)
			values.append(value)
		
		id_col = columns[0]
		id_value = values[0]
		columns.remove(id_col)
		values.remove(id_value)
		
		for column,value in zip(columns,values):
			q = "update %s SET %s='%s' where %s='%s'" % (self.name,column,value,id_col,id_value)
			self._query(q)
		return self.db_cursor.rowcount
		
	def get_sensor(self):
		q = "select * from sensors"
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
		
	def get_widgetinfo(self,column,value):
		q = "select info from sensor_widget where %s='%s'" %(column,value)
		self._query(q)
		
		row = self.db_cursor.fetchone()
		ids = []
		for type in row[0]:
			q = "select widget_id from widget where type='%s'" % (type)
			self._query(q)
			value = self.db_cursor.fetchone()
			ids.append(value[0])
			
		return row[0],ids
		
	def get_logging(self,dev_id,id,start,end):
		q = "select * from %s where device_id='%s' and sensor_id='%s' and timestamp between %s and %s" % (self.name,dev_id,id,start,end)
		self._query(q)
		
		return self.db_cursor.fetchall()
		
	def get_logging_items(self,dev_id,ids,start,end):
		fmt1 = ("%s," *len(ids))[:-1]
		q = "select * from %s where device_id='%s' and sensor_id in (%s) and timestamp between %s and %s" % (self.name,dev_id,fmt1,start,end)
		self._query(q,ids)
		return self.db_cursor.fetchall()
		
		
class db:

	def  __init__(self,**kwargs):
		if kwargs:
			self.connect(**kwargs)

	def connect(self,**kwargs):
		self.obj = psycopg2.connect(**kwargs)
		self.obj.autocommit = True
		
class configure:
	
	def config(self,filename):
		config = ConfigParser()
		config.read(filename)

		#reading db_config.ini
		db_name = config.get('database','db_name')
		user_name = config.get('database','user_name')
		pword = config.get('database','password')
		host_ip = config.get('server','host')
		port_num = config.get('server','port')
		
		return db_name,user_name,pword,host_ip,port_num
