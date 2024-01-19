import os
import pandas as pd


def distribution_per_uc(solver, A, uc, year, semester):
    """
    This function creates a structure with the distributio of each shift of a determinated uc.
    """
    distr = {}
    students = []
    path_compare = os.path.join("analytics", "distribution.py")
    if(os.path.relpath(__file__) == path_compare):
        path = os.path.join("data", "uni_data", "inscritos_anon.csv")
    else:
        path = os.path.join(".", "..", "schedule", "schedule", "data", "uni_data", "inscritos_anon.csv")
    csv_read = pd.read_csv(path)
    
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
    '''
    This function returns a dictionary with the number of students allocated for each UC (order desc).
    '''
    allocated_number = {}
   
    for _, ucs in students_data.items():
        for uc in ucs:
            if uc not in allocated_number:
                allocated_number[uc] = 1
            else:
                allocated_number[uc] += 1

    stats = list(allocated_number.items())
    stats.sort(key = lambda x: (x[1]), reverse=True)
    return (stats, allocated_number)


def distribution_probabilities(solver, A, students_data, uc, year, semester):
    '''
    This function returns a structure with the percentage of students allocated for each shift in a determinated UC.
    '''

    distr = distribution_per_uc(solver, A, uc, year, semester)
    tup = allocated_number_per_uc(students_data)
    aloc_number_info = tup[1]
    res = {}


    for type_class in distr:
        res[type_class] = {}
        for shift in distr[type_class]:
            res[type_class][shift] = {}
            for slot in distr[type_class][shift]:
                res[type_class][shift][slot] = str(round((distr[type_class][shift][slot]/aloc_number_info[uc])*100, 2))
                res[type_class][shift][slot]+="%"


    return res
