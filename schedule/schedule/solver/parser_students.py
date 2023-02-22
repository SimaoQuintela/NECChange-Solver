import pandas as pd

def read_students_info():
    csv_read = pd.read_csv("data/inscritos_anon.csv")
    students_data = {}
    
    data_groupped = csv_read.groupby(["Nº Mecanográfico", "Nome"])["Unidade Curricular"]

    for (number, _), ucs  in data_groupped:
        students_data[number] = list(ucs)

    return students_data