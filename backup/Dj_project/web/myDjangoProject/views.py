from django.shortcuts import render

def index(request):
	return render(request, "run_python.html")
