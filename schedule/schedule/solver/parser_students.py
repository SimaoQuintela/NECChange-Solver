import pandas as pd

def read_students_info():
    """
    This function reads the info about the courses that students are attending from a csv file
    """
    csv_read = pd.read_csv("data/inscritos_anon.csv")
    students_data = {}
    
    data_groupped = csv_read.groupby(["Nº Mecanográfico", "Nome"])["Unidade Curricular"]

    for (number, _), ucs  in data_groupped:
        students_data[number] = list(ucs)

    return students_data