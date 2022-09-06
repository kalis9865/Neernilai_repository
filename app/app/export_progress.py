import json
import os
import glob

class export_progress():

	def pdf_check(self,req,file_dir):
		path = os.path.join(os.path.dirname(os.path.realpath(__file__)),file_dir)
		#files = []
		#for x in os.listdir(path):
			#if x.endswith(".pdf"):
				#files.append(x)
		filename = ""
		if (file_dir == "pdf_files/"):
			filename = req.session.get('pdf_filename')
		elif (file_dir == "csv_files/"):
			filename = req.session.get('csv_filename')
			
		file_path = os.path.join(os.path.dirname(os.path.realpath(__file__)),file_dir,filename)
		if os.path.exists(file_path):
				return json.dumps({'res':1,'filename':filename})
		else:
				return json.dumps({'res':0,'filename':"not found"})
