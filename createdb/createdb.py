import psycopg2
from configparser import ConfigParser

sensordb = 'sensor_data'
viewdb = 'config_db'

def configure():

	config = ConfigParser()
	config.read('config.ini')

	user_name = config.get('database','user_name')
	pword = config.get('database','password')
	host_ip = config.get('server','host_ip')
	port_num = config.get('server','port')

	createDb(user_name,pword,host_ip,port_num)

def createDb(user_name,pword,host_ip,port_num):

	conn = psycopg2.connect(
		user = user_name,
		password = pword,
		host = host_ip,
		port = port_num
	)

	conn.autocommit = True
	cursor = conn.cursor()

	#create sensor database
	sensor_sql1 = f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = 'sensor_data';"
	sensor_sql2 = f"CREATE DATABASE sensor_data;"
	cursor.execute(sensor_sql1)
	exists1 = cursor.fetchone()
	if not exists1:
		cursor.execute(sensor_sql2)
		print("sensor database created")
		sensorTable(sensordb,user_name,pword,host_ip,port_num)

	#create config_db database
	view_sql1 = f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = 'config_db';"
	view_sql2 = f"CREATE DATABASE config_db;"

	cursor.execute(view_sql1)
	exists2 = cursor.fetchone()
	if not exists2:
		cursor.execute(view_sql2)
		print("config_db Databse created")
		createTable(viewdb,user_name,pword,host_ip,port_num)
	cursor.close()
	conn.close()

def createTable(db_name,user_name,pword,host_ip,port_num):

	conn = psycopg2.connect(
		database = db_name,
                user = user_name,
                password = pword,
                host = host_ip,
                port = port_num
        )
	conn.autocommit = True

	commands = (
	'''
	CREATE TABLE IOTUSER(
	USER_ID SERIAL PRIMARY KEY,
	UNIQUE(USER_ID),
	USER_NAME VARCHAR(20) UNIQUE,
	PASSWORD TEXT NOT NULL UNIQUE,
	EMAIL TEXT NOT NULL UNIQUE,
	ROLE INT NOT NULL,
	STATUS BOOLEAN,
	MAIL_STATUS TEXT
	)''',

	'''
	CREATE TABLE DASHBOARD(
		DASHBOARD_ID SERIAL NOT NULL PRIMARY KEY,
		DASHBOARD_NAME TEXT NOT NULL UNIQUE,
		SENSOR_INFO JSON NOT NULL,
		LAYOUT JSON NOT NULL
	)''',

	'''
	CREATE TABLE SENSORS(
		SENSOR_ID SERIAL PRIMARY KEY,
		SENSOR_NAME TEXT NOT NULL UNIQUE
	)''',

	'''
	CREATE TABLE WIDGET (
		WIDGET_ID SERIAL PRIMARY KEY,
		TYPE TEXT NOT NULL UNIQUE
	)''',
	
	'''
	CREATE TABLE SENSOR_WIDGET(
		ID SERIAL,
		INFO JSON NOT NULL
	)''',
	
	'''
	CREATE TABLE DEVICE (
                DEVICE_ID SERIAL PRIMARY KEY,
                DEVICE_NAME TEXT NOT NULL UNIQUE,
                MAC_ID TEXT NOT NULL UNIQUE,
                SENSOR_IDS JSON NOT NULL,
		DESCRIPTION TEXT,
		STATUS BOOLEAN NOT NULL
        )''',

	'''
	CREATE TABLE LOGIN_DETAILS(
		SESSION_ID SERIAL,
		LOGIN_TIME TIME NOT NULL,
		LOGOUT_TIME TIME NOT NULL,
		USER_ID INT NOT NULL,
		FOREIGN KEY(USER_ID) REFERENCES IOTUSER(USER_ID)
	)''',
	
	'''
	CREATE TABLE ROLE(
		ROLE_ID SERIAL,
		ROLE_NAME TEXT NOT NULL UNIQUE
	)
	'''
	)

	cursor = conn.cursor()

	for command in commands:
		cursor.execute(command)

	cursor.close()
	conn.close()

def sensorTable(db_name,user_name,pword,host_ip,port_num):

	conn = psycopg2.connect(
			database = db_name,
			user = user_name,
			password = pword,
			host = host_ip,
			port = port_num
		)

	conn.autocommit = True

	sql = '''CREATE TABLE LOGGING_DATA(
                TIMESTAMP INTEGER,
                DEVICE_ID INT NOT NULL,
                SENSOR_ID INT NOT NULL,
                VALUE FLOAT8 NOT NULL
        	)
		'''

	cursor = conn.cursor()
	cursor.execute(sql)

	cursor.close()
	conn.close()

configure()

