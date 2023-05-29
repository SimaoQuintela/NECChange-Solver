import json
from pprint import pprint


def overlaps_per_shift(info):
	res = {}


	for student in info:
		for dic in info[student]:
			uc_name = dic['uc']
			if uc_name not in res:
				res[uc_name] = {}
			type_class = dic['type_class']
			shift = dic['shift']
			if f"{type_class}{shift}" not in res[uc_name]:
				res[uc_name][f"{type_class}{shift}"] = 0
			slots = dic['slots']
			for l in slots:
				if True in l:
					res[uc_name][f"{type_class}{shift}"] += 1


				
	pprint(res)




def sort_aux(s):
	days = {
		"Segunda" : 1,
		"Terça" : 2,
		"Quarta" : 3,
		"Quinta" : 4,
		"Sexta" : 5
	}

	l = s.split('/')
	day = l[0]
	day = day[:-1]

	return days[day]



def overlaps_per_student(info, student):
	res = {}

	if int(student[1:]) not in res:
		res[int(student[1:])] = []
	for dic in info[student]:
		uc_name = dic['uc']
		type_class = dic['type_class']
		shift = dic['shift']
		slots = dic['slots']
		for l in slots:
			if True in l:
				buf = f"{l[0]} / {l[1]}:{l[2]} - {l[3]}:{l[4]} / {uc_name} / {type_class}{shift}"
				res[int(student[1:])].append(buf)

	res[int(student[1:])].sort(key = sort_aux)
	pprint(res)

def shifts_distribution(info):

	res = {}

	for student in info:
		for dic in info[student]:
			uc_name = dic['uc']
			if uc_name not in res:
				res[uc_name] = {}
			type_class = dic['type_class']
			shift = dic['shift']
			if f"{type_class}{shift}" not in res[uc_name]:
				res[uc_name][f"{type_class}{shift}"] = 1
			else:
				res[uc_name][f"{type_class}{shift}"] += 1


	pprint(res)


def allocated_number(info):

	res = {}
	

	for student in info:
		cache = list()
		for dic in info[student]:
			uc_name = dic['uc']
			if uc_name not in res and uc_name not in cache:
				res[uc_name] = 1
				cache.append(uc_name)
			elif uc_name in res and uc_name not in cache:
				res[uc_name] += 1
				cache.append(uc_name)
			else:
				pass
		


	pprint(res)




def menu():

	with open('../../web/public/data/alocation.json') as f:
		json_data = f.read()

	info = json.loads(json_data)


	print("\n\n\n\nDATA ANALYSIS MENU")
	while True:
		print("\n\n\n\nChoose an option:\n")
		print("1 - Students overlaps and number of conflicts.")
		print("2 - Shifts distribution.")
		print("3 - Overlaps per shift.")
		print("4 - Students allocated number per UC.")
		print("5 - Leave Menu.\n\n") 
		option = int(input("Option: "))
		if option >= 5 or option == 0: break
		elif option == 1:
			student_nr = input("Enter student number, e.g: A94447: ")
			overlaps_per_student(info, student_nr)
		elif option == 2:
			shifts_distribution(info)
		elif option == 3:
			overlaps_per_shift(info)
		elif option == 4:
			allocated_number(info)




menu()