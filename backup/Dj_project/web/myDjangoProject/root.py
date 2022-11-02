
from django.http import HttpResponse

from . import user

def landing(request):
	#page = request.POST['page']

	obj_user = user.user()
	msg = obj_user.main_user(request)
	return HttpResponse(msg)
