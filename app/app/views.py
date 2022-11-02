from django.shortcuts import render,redirect
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, Http404
import os

@csrf_exempt
def index(request):
	if request.session.keys():
		for key in list(request.session.keys()):
			del request.session[key]

	return render(request, 'index.html')

def base(request):
	return render(request,'base.html')
	
def dash(request):
	return render(request,'dash.html')

def settings(request):
	if request.session.keys():
		return render(request, 'settings.html')
	else:
		return redirect('/')

def dashboard(request):
	if request.session.keys():
		return render(request, 'dashboard.html')
	else:
		return redirect('/')

def assets(request):
	if request.session.keys():
		return render(request, 'assets.html')
	else:
		return redirect('/')

def createdashboard(request):
	if request.session.keys():
		return render(request, 'createdashboard.html')
	else:
		return redirect('/')

def newdashboard(request):
	if request.session.keys():
		return render(request, 'newdashboard.html')
	else:
		return redirect('/')
		
def editdashboard(request):
	if request.session.keys():
		return render(request, 'editdashboard.html')
	else:
		return redirect('/')	

def health(request):
	if request.session.keys():
		return render(request, 'health.html')
	else:
		return redirect('/')

def export(request):
	if request.session.keys():
		return render(request, 'export.html')
	else:
		return redirect('/')

def firmware(request):
	if request.session.keys():
		return render(request, 'firmware.html')
	else:
		return redirect('/')

def forgot(request):
    return render(request, 'forgot-password.html')

def register(request):
    return render(request, 'register.html')

def getpdf(request):
	if request.session.keys():
		path = os.path.join(os.path.dirname(os.path.realpath(__file__)),'pdf_files/')
		files = []
		for x in os.listdir(path):
			if x.endswith(".pdf"):
				files.append(x)

		file_path = os.path.join(os.path.dirname(os.path.realpath(__file__)),'pdf_files/',files[0])
		if os.path.exists(file_path):
			with open(file_path, 'rb') as fh:
				response = HttpResponse(fh.read(), content_type="application/pdf")
				response['Content-Disposition'] = 'inline; filename=' + file_path
				return response
		raise Http404
	else:
		return redirect('/')



def getcsv(request):
	if request.session.keys():
		path = os.path.join(os.path.dirname(os.path.realpath(__file__)),'csv_files/')
		files = []
		for x in os.listdir(path):
			if x.endswith(".csv"):
				files.append(x)

		file_path = os.path.join(os.path.dirname(os.path.realpath(__file__)),'csv_files/',files[0])
		if os.path.exists(file_path):
			with open(file_path, 'rb') as fh:
				response = HttpResponse(fh.read(), content_type="text/csv")
				response['Content-Disposition'] = 'inline; filename=' + file_path
				return response
		raise Http404
	else:
		return redirect('/')
