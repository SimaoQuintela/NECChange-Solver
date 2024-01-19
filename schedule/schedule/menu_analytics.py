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

	n = input("\n\nGet students numbers (y/n): ")
	if(n.upper() == "Y"):
		print("\n")
		list_ucs = list(res.keys())
		res = {}
		print("Put \"b\" to back for the Menu")
		for i,uc in enumerate(list_ucs):
			print(f"{i+1} - {uc}")
		print("0 - All ucs")
		n = input("\nOption: ")
		if n == "b":
			pass
		elif n == "0":
			for student in info:
				for dic in info[student]:
					uc_name = dic['uc']
					if uc_name not in res:
						res[uc_name] = {}
					type_class = dic['type_class']
					shift = dic['shift']
					if f"{type_class}{shift}" not in res[uc_name]:
						res[uc_name][f"{type_class}{shift}"] = list()
					slots = dic['slots']
					for l in slots:
						if True in l:
							res[uc_name][f"{type_class}{shift}"].append(student)
							break
			pprint(res)
		else:
			for student in info:
				for dic in info[student]:
					uc_name = dic['uc']
					if uc_name != list_ucs[int(n)-1]:
						pass
					else:
						if uc_name not in res:
							res[uc_name] = {}
						type_class = dic['type_class']
						shift = dic['shift']
						if f"{type_class}{shift}" not in res[uc_name]:
							res[uc_name][f"{type_class}{shift}"] = list()
						slots = dic['slots']
						for l in slots:
							if True in l:
								res[uc_name][f"{type_class}{shift}"].append(student)
								break
			pprint(res)
			

	else:
		pass






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




def key_parser(student):
	res = student.upper()
	if res[0] == 'A':
		return res
	else:
		return "A" + res



def overlaps_per_student(info, student):
	res = {}
	num = denom = 0


	if student == "0":

		for student in info:
			stud_k = int(student[1:])
			if stud_k not in res:
				res[stud_k] = []
			for dic in info[student]:
				uc_name = dic['uc']
				type_class = dic['type_class']
				shift = dic['shift']
				slots = dic['slots']
				for l in slots:
					if True in l:
						buf = f"{l[0]} / {l[1]}:{l[2]} - {l[3]}:{l[4]} / {uc_name} / {type_class}{shift}"
						res[stud_k].append(buf)

		for student in res:
			res[student].sort(key = sort_aux)

			if res[student] != []:
				num += 1
			denom += 1


		pprint(res)
		print(f"\n{num} de {denom} alunos ({round(num/denom * 100,2)}%) possuem conflitos no seu horário.\n")
	
	else:
		stud_k = key_parser(student)
		if stud_k not in info:
			print("\n\nStudent number not valid.")
		else:
			res[stud_k] = list()
			for dic in info[stud_k]:
					uc_name = dic['uc']
					type_class = dic['type_class']
					shift = dic['shift']
					slots = dic['slots']
					for l in slots:
						if True in l:
							buf = f"{l[0]} / {l[1]}:{l[2]} - {l[3]}:{l[4]} / {uc_name} / {type_class}{shift}"
							res[stud_k].append(buf)

			for student in res:
				res[student].sort(key = sort_aux)


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
	path = os.path.join("..", "..", "web", "public", "data", "alocation.json")
	with open(path, 'r', encoding='utf-8') as f:
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
			print("\n\nPut \"b\" to back for the Menu")
			student = input("Enter the student number or enter \"0\" to get overlaps for all students: ")
			if student == "b":
				pass
			else:
				overlaps_per_student(info, student)
		elif option == 2:
			shifts_distribution(info)
		elif option == 3:
			overlaps_per_shift(info)
		elif option == 4:
			allocated_number(info)
	




menu()
