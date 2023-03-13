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