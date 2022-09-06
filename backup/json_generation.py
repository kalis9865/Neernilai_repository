import json
import collections

device_list = []
d = collections.OrderedDict()
for i in range(1,2):
	d = collections.OrderedDict()
	d["device_id"] = i
	d["device_name"] = "device_"+str(i)
	d["mac_id"] ="mac_"+str(i)

	#device_list.append(d)

x = json.dumps(d)
y = json.loads(x)

column = list(y.keys())

print(y[column[1]])
