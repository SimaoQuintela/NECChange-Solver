from collections import OrderedDict

def allocated_number(students_data):
	#this function returns a dictionary with the number of students allocated for each uc (order desc)
	allocated_number = {}
    
   
	for student, ucs in students_data.items():
		for uc in ucs:
			if uc not in allocated_number:
				allocated_number[uc] = 1
			else:
				allocated_number[uc] += 1

	sorted_al_n = {k: v for k, v in sorted(allocated_number.items(), key = lambda tup: -tup[1])}
    
	return OrderedDict(sorted_al_n)
