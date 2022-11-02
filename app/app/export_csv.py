import json
import os
import glob
import time
import pytz
import csv
from datetime import datetime

from . import db_wrapper

tz_NY = pytz.timezone('Asia/Kolkata')
filename = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'db_config.ini')

table_name = "logging_data"

class export_csv():
	config_obj = db_wrapper.configure()
	db_name,user_name,pword,host_ip,port_num = config_obj.config(filename)
	
	def generate_csv(self,req):
		print("entered generate csv")
		print(req)
		user_name = req.session.get('username')
		dev_id = req.POST['device_id']
		dev_name = req.POST['device_name']
		sensor_ids = json.loads(req.POST['sensor_ids'])
		sensor_names = json.loads(req.POST['sensor_names'])
		start_date = req.POST['start_date']
		end_date = req.POST['end_date']
		
		start = datetime.strptime(start_date,'%Y/%m/%d %H:%M:%S')
		end = datetime.strptime(end_date,'%Y/%m/%d %H:%M:%S')
		ts_start = time.mktime(start.timetuple())
		ts_end = time.mktime(end.timetuple())
		
		db_obj1=db_wrapper.db(database="sensor_data",user=self.user_name,password=self.pword,host=self.host_ip,port=self.port_num)
		table_obj1 = db_wrapper.table(db_obj1,table_name)

		db_obj2=db_wrapper.db(database="config_db",user=self.user_name,password=self.pword,host=self.host_ip,port=self.port_num)
		table_obj2 = db_wrapper.table(db_obj2,"device")
		mac_data= table_obj2.get_mac(dev_id)
		mac_id= mac_data[0]		

		path = os.path.join(os.path.dirname(os.path.abspath(__file__)),"csv_files")
		isExist = os.path.exists(path)
		if not isExist:
			os.mkdir(path)
		#removing existing files
		# existing_path = os.path.join(os.path.dirname(os.path.abspath(__file__)),'')		
		existing_path = os.path.join(os.path.dirname(os.path.realpath(__file__)),'csv_files/')
		print("existing_path"+existing_path)
		files = glob.glob(existing_path+"*.csv")
		for f in files:
			os.remove(f)
			
		now = datetime.now(tz_NY)
		current_date = now.strftime("%d/%m/%Y %H:%M:%S")
		current_date_str = ((current_date.replace("/","-")).replace(":","-")).replace(" ","_")
		
		csv_fileName = user_name +"_"+ dev_name.replace(" ","_") + "_" + current_date_str + ".csv"		
		req.session['csv_filename'] = csv_fileName

		
		# csv_filepath = os.path.join(os.path.dirname(os.path.abspath(__file__)),'',csv_fileName)
		csv_filepath = os.path.join(os.path.dirname(os.path.realpath(__file__)),'csv_files/',csv_fileName)
		print("csv_filepath"+csv_filepath)
		print(f"dev_id {dev_id}")
		print(f"sensor_ids {sensor_ids}")
		print(f"ts_start {ts_start}")
		print(f"mac_id {mac_id}")
		rows = table_obj1.get_logging_items(mac_id,sensor_ids,ts_start,ts_end)
		print(f"rows {rows}")
		fields = ['S.No','Date and Time', 'Device Name', 'Sensor Name', 'Value']
		
		final_rows = []
		for i in range(0,len(rows)):
			row = rows[i]
			date_time = datetime.fromtimestamp(row[0])
			index_i = sensor_ids.index(str(row[2]))
			final_row = [i+1,str(date_time),dev_name,sensor_names[index_i],row[3]]			
			final_rows.append(final_row)

		print(f"final_rows  {final_rows}")
		with open(csv_filepath, 'w',encoding='UTF8', newline='') as csvfile: 
			csvwriter = csv.writer(csvfile)
			csvwriter.writerow(fields) 
			csvwriter.writerows(final_rows)
			
		
		