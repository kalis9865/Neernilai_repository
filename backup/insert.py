def insert(row):
	column = list(row.keys())
	value = []
	final_column = []
	for i in column:
		final_column.append(str(i))
		value.append(row[i])

	fmt1 = ("%s," *len(column))[:-1]
	fmt2 = ("%s," *len(value))[:-1]

	print(fmt1)
	print(fmt2)

	print(final_column[1])

add_dict ={'device_name':"device one",'mac_id':"13764hdh",'sensors':{'temp','level'},'description':"first device",'status':1}
insert(add_dict)

