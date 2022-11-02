import json
import os
import glob
import collections
import time
import pytz
from fpdf import FPDF

from datetime import datetime
from . import db_wrapper

tz_NY = pytz.timezone('Asia/Kolkata')

filename = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'db_config.ini')
image_path = os.path.join(os.path.dirname(os.path.realpath(__file__)),'logo.png')

table_name = "logging_data"

class export_pdf():
	config_obj = db_wrapper.configure()
	db_name,user_name,pword,host_ip,port_num = config_obj.config(filename)

	def generate_pdf(self,req):
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

		path = os.path.join(os.path.dirname(os.path.abspath(__file__)),"pdf_files")
		isExist = os.path.exists(path)
		if not isExist:
			os.mkdir(path)

		#removing existing files
		existing_path = os.path.join(os.path.dirname(os.path.realpath(__file__)),'pdf_files/')
		files = glob.glob(existing_path+"*.pdf")
		for f in files:
			os.remove(f)

		now = datetime.now(tz_NY)
		current_date = now.strftime("%d/%m/%Y %H:%M:%S")
		current_date_str = ((current_date.replace("/","-")).replace(":","-")).replace(" ","_")

		pdf_fileName = user_name +"_"+ dev_name.replace(" ","_") + "_" + current_date_str + ".pdf"
		req.session['pdf_filename'] = pdf_fileName
		pdf_filepath = os.path.join(os.path.dirname(os.path.realpath(__file__)),'pdf_files/',pdf_fileName)
		#pdf generation
		title = 'Location Data'
		f= open(pdf_filepath,"w")

		pdf = FPDF()
		pdf.add_page()

		page_width = pdf.w - 2 * pdf.l_margin

		pdf.image(image_path,80, 5, h=25,w=50)
		pdf.ln(25)

		pdf.set_font('Times','B',18)
		pdf.cell(page_width, 0.0, title, align='C')
		pdf.ln(10)

		pdf.set_font('Times','B',12)
		pdf.cell(22,0,"Start Date: ")
		pdf.set_font('Times','',12)
		pdf.cell(30,0,start_date)
		pdf.ln(0.5)

		pdf.set_font('Times','B',12)
		pdf.set_x(145)
		pdf.cell(27,0,"Name: ")
		pdf.set_font('Times','',12)
		pdf.cell(30,0,dev_name)
		pdf.ln(6)

		pdf.set_font('Times','B',12)
		pdf.cell(20,0,"End Date: ")
		pdf.set_font('Times','',12)
		pdf.cell(30,0,end_date)
		pdf.ln(0.5)

		'''sensors=""
		if (len(sensor_names) == 5):
			sensors = "All"
			pdf.set_x(140)
		elif (len(sensor_names) <= 2):
			sensors = ','.join(sensor_names)
			pdf.set_x(140)'''

		sensors = ',\n'.join(sensor_names)

		pdf.set_font('Times','B',12)
		pdf.set_x(145)
		pdf.cell(17,len(sensor_names),"Sensors: ")
		pdf.set_font('Times','',12)
		pdf.multi_cell(30,len(sensor_names),sensors)
		pdf.ln(5)

		'''pdf.set_font('Times','B',12)
		pdf.cell(17,0,"Sensors: ")
		pdf.set_font('Times','',12)
		pdf.cell(30,0,sensors)
		pdf.ln(6)'''

		col_width = page_width/2
		pdf.ln(1)

		units = ["%","mg/L","%","pH","deg cel","ft","cm","kt"]
		for i in range(0,len(sensor_ids)):
			rows = table_obj1.get_logging(mac_id,sensor_ids[i],ts_start,ts_end)

			sensor_title = "Sensor: "+ sensor_names[i]
			pdf.set_font('Times','B',14)
			pdf.cell(page_width,0.0,sensor_title,align='C')
			pdf.ln(6)

			value_head = "Value(" + units[int(sensor_ids[i])-1] + ")"
			pdf.set_font('Arial', 'B', 12)
			th = pdf.font_size+2
			pdf.cell(col_width, th+3, "Date and Time", border=1,align='C')
			pdf.cell(col_width, th+3, value_head, border=1,align='C')
			pdf.ln(th+3)

			pdf.set_font('Arial', '', 12)
			if len(rows) > 0:
				for row in rows:
					date_time = datetime.fromtimestamp(row[0])
					pdf.cell(col_width, th, str(date_time), border=1)
					pdf.cell(col_width, th, str(row[3]), border=1)
					pdf.ln(th)

			pdf.ln(10)
			pdf.add_page()

		pdf.ln(10)
		pdf.output(pdf_filepath,'F')

		f.close()

		#if os.path.exists(pdf_filepath):
			#return 1
		#else:
			#return 0
