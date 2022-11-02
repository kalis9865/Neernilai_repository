import os, time,datetime
os.environ['TZ'] = 'Asia/Kolkata'

time.tzset()

ts = datetime.datetime.now()
#tm = 07/12/2021 12:43:13
unix_time = time.mktime(ts.timetuple())

t=ts.strftime("%m/%d/%Y, %H:%M:%S")
print("Unix_Time_stamp: ",unix_time)
print(time.mktime(t.timetuple()))

print(datetime.datetime.fromtimestamp(unix_time))
