from pprint import pprint
import pandas as pd

def distribution_per_uc(solver, A, uc, year, semester):
    distr = {}
    students = []

    csv_read = pd.read_csv("data/inscritos_anon.csv")
    data_groupped = csv_read.groupby(["Unidade Curricular", "Nº Mecanográfico"])

    for uc_csv in data_groupped:
        if str(uc_csv[0][0]) == uc:
            students.append(uc_csv[0][1])
        
    for student in students:
        for type_class in A[student][year][semester][uc]:
            if type_class not in distr:
                distr[type_class] = {}  
            for shift in A[student][year][semester][uc][type_class]:
                if shift not in distr[type_class]:
                    distr[type_class][shift] = {}
                for slot in A[student][year][semester][uc][type_class][shift]:
                    if slot not in distr[type_class][shift]:
                        distr[type_class][shift][slot] = 0
                    distr[type_class][shift][slot] += solver.Value(A[student][year][semester][uc][type_class][shift][slot])
    
    return distr



def allocated_number_per_uc(students_data):
    #this function returns a dictionary with the number of students allocated for each uc (order desc)
    allocated_number = {}
   
    for _, ucs in students_data.items():
        for uc in ucs:
            if uc not in allocated_number:
                allocated_number[uc] = 1
            else:
                allocated_number[uc] += 1

    stats = list(allocated_number.items())
    stats.sort(key = lambda x: (x[1]), reverse=True)
    return stats
