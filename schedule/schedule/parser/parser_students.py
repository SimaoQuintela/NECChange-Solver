import os
import pandas as pd

def read_students_info():
    """
    This function reads the info about the courses that students are attending from a csv file.
    """
    path_compare = os.path.join("parser", "parser_students.py")

    if(os.path.relpath(__file__) == path_compare):
        path = os.path.join("data", "uni_data", "inscritos_anon.csv")
    else:
        path = os.path.join(".", "..", "schedule", "schedule", "data", "uni_data", "inscritos_anon.csv")

    csv_read = pd.read_csv(path)
    students_data = {}
    data_groupped = csv_read.groupby(["Nº Mecanográfico", "Nome"])["Unidade Curricular"]

    for (number, _), ucs  in data_groupped:
        students_data[number] = list(ucs)

    return students_data