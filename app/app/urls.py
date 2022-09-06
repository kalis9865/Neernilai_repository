"""app URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path

from . import views
from . import root

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.index,name='index'),
	path('settings/', views.settings,name='settings'),
    path('dashboard/', views.dashboard,name='dashboard'),
    path('assets/', views.assets,name='assets'),
    path('createdashboard/', views.createdashboard,name='createdashboard'),
	path('newdashboard/', views.newdashboard,name='newdashboard'),
    path('editdashboard/', views.editdashboard,name='editdashboard'),
    path('health/', views.health,name='health'),
    path('export/', views.export,name='export'),
    path('firmware/', views.firmware,name='firmware'),
    path('forgot-password/', views.forgot,name='forgot-password'),
    path('register/', views.register,name='register'),
	path('base/', views.base,name='base'),
	path('dash/', views.dash,name='dash'),
    path('pdf',views.getpdf),
	path('csv',views.getcsv),
    path('root',root.landing),
]
