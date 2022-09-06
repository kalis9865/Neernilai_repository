from django.http import HttpResponse
import os
#from django.core.cache import cache

from . import user
from . import device
from . import createdashboard
from . import widget
from . import export_pdf
from . import export_csv
from . import sensor
from . import export_progress
from . import role
from . import settings_config
from . import forgot_password

def landing(request):
	#cache.clear()
	page = request.POST['page']

	if(page == "user"):
		user_obj = user.user()
		res_data = user_obj.main_user(request)
		return HttpResponse(res_data)
		
	elif(page == "role"):
		role_obj = role.role()
		res_data = role_obj.main_role(request)
		return HttpResponse(res_data)
		
	elif(page == "forgot_password"):
		forgot_obj = forgot_password.forgot()
		res_data = forgot_obj.main_forgot(request)
		return HttpResponse(res_data)

	elif(page == "device"):
		dev_obj = device.device()
		res_data = dev_obj.main_device(request)
		return HttpResponse(res_data)
		
	elif(page == "sensor"):
		sensor_obj = sensor.sensor()
		res_data = sensor_obj.main_sensor(request)
		return HttpResponse(res_data)

	elif(page == "create_dashboard"):
		dashboard_obj = createdashboard.dashboard()
		res_data = dashboard_obj.main_dashboard(request)
		return HttpResponse(res_data)
		
	elif(page == "widget"):
		widget_obj = widget.widget()
		res_data = widget_obj.main_widget(request)
		return HttpResponse(res_data)
		
	elif(page == "export_pdf"):
		export_obj = export_pdf.export_pdf()
		try:
			res_data = 1
			return HttpResponse(res_data)
		finally:
			export_obj.generate_pdf(request)

	elif(page == "export_csv"):
		export_csv_obj = export_csv.export_csv()
		try:
			res_data = 1
			return HttpResponse(res_data)
		finally:
			export_csv_obj.generate_csv(request)
			
	elif(page == "export_progress"):
		progress_obj = export_progress.export_progress()
		if (request.POST['file_type'] == "pdf"):
			res_data = progress_obj.pdf_check(request,"pdf_files/")
			return HttpResponse(res_data)
			
		elif (request.POST['file_type'] == "csv"):
			res_data = progress_obj.pdf_check(request,"csv_files/")
			return HttpResponse(res_data)
			
	elif (page == "settings"):
		settings_obj = settings_config.Settings()
		res_data = settings_obj.main_settings(request)
		return HttpResponse(res_data)
