def slots_per_student(A, student, semester):
	slots = []

	for year in A[student]:
		for uc in A[student][year][semester]:
			for type_class in A[student][year][semester][uc]:
				for shift in A[student][year][semester][uc][type_class]:
					for slot in A[student][year][semester][uc][type_class][shift]:
						if slot not in slots:
							slots.append(slot)
	return slots

def workload_student(solver, A, student, semester):
	#this function says how many hours of classes a student has in each day
   

	days = {1: "Segunda", 2: "Terça", 3: "Quarta", 4: "Quinta", 5: "Sexta"}

	workload = {}
	for day in days.values():
		workload[day] = 0

	aux_slots = [] #slots that we already count (avoid counting twice overlapped slots)

	for slot in slots_per_student(A, student, semester):
		for year in A[student]:
			for uc in A[student][year][semester]:
				for type_class in A[student][year][semester][uc]:
					for shift in A[student][year][semester][uc][type_class]:
						if slot in A[student][year][semester][uc][type_class][shift] and slot not in aux_slots:
							if(solver.Value(A[student][year][semester][uc][type_class][shift][slot]) == 1):
								workload[days[slot[0]]] += 0.5
								aux_slots.append(slot)


	return workload