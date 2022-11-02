import psycopg2
import json
import time
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

	time.sleep(5)
	createDb(user_name,pword,host_ip,port_num)

def createDb(user_name,pword,host_ip,port_num):

	sensor_table_data = {
        "sensor_name": ['Dissolved-O2', 'Dissolved-Solids', 'Humidity', 'pH', 'Temperature', 'Water-Level', 'Water-Current', 'Wind-Speed'],
    }
	widget_table_data = {
        "type": ['Bar-Graph', 'Line-Graph', 'Pressure-Gauge', 'Tank-Gauge', 'Temperature-Gauge']
    }
	sensor_widget_table_data = {
        "info": [["Bar-Graph","Line-Graph"],["Bar-Graph","Line-Graph"], ["Bar-Graph","Line-Graph", "Temperature-Gauge"], ["Bar-Graph","Line-Graph", "Temperature-Gauge"], ["Bar-Graph","Line-Graph", "Temperature-Gauge"], ["Bar-Graph","Line-Graph","Tank-Gauge"], ["Bar-Graph","Line-Graph","Pressure-Gauge"], ["Bar-Graph","Line-Graph","Pressure-Gauge"]]
    }
	iotuser_table_data = {
        "user_name": "Admin",
        "password": "admin@123",
        "email": "admin@gmail.com",  
        "role": 1,       
        "status": "t",
        "mail_status":"1"        
    }
	connection_data = {
        "db_name" : viewdb,
        "user_name" : user_name,
        "pword" : pword,
        "host" : host_ip,
        "port" : port_num
    }

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
		add_table_data(connection_data, "sensors", sensor_table_data)
		add_table_data(connection_data, "widget", widget_table_data)
		add_table_data(connection_data, "sensor_widget", sensor_widget_table_data)
		add_table_data(connection_data, "iotuser", iotuser_table_data)

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

def add_table_data(db_connection_data, table_name, table_datas):

    conn = psycopg2.connect(
        database = db_connection_data['db_name'],
		user = db_connection_data['user_name'],
		password = db_connection_data['pword'],
		host = db_connection_data['host'],
		port = db_connection_data['port']
    )
    print(f"con wtih dbname {conn}")
    conn.autocommit = True 
    cursor = conn.cursor()
    print(f"cursor wtih dbname {cursor}") 
   
    print("Table created successfully")
    time.sleep(3)
    column = tuple(table_datas.keys())
    if len(column) ==1:
        for column_name, column_data in table_datas.items():         
            print(f"key is {column_name} {column_data}")
            if type(column_data) == list:
                for data in column_data:
                    if type(data) == list:
                        sql = f"INSERT INTO {table_name} ({column_name}) values('{json.dumps(data)}');"
                        cursor.execute(sql)
                    else:
                        sql = f"INSERT INTO {table_name} ({column_name}) values('{data}');"
                        cursor.execute(sql)
    elif len(column) >1:    
        column = tuple(table_datas.keys())
        data = tuple(table_datas.values())
        output  = "({})".format(", ".join(column))            
        sql = sql = f"INSERT INTO {table_name} {output} values {data};"           
        cursor.execute(sql)   

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
                DEVICE_ID TEXT NOT NULL,
                SENSOR_ID INT NOT NULL,
                VALUE FLOAT8 NOT NULL
        	)
		'''

	cursor = conn.cursor()
	cursor.execute(sql)

	cursor.close()
	conn.close()

configure()

