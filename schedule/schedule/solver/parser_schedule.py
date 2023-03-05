import pandas as pd

def read_schedule_csv(slots):
    """
    This functions reads the data from the horario.csv and returns a structure
    that represents the schedule of the course.
    """
    S = {}
    csv_read = pd.read_csv("data/horario.csv")
    data_groupped = csv_read.groupby(["ano","semestre","código da uc","uc"])
    
    for (year, semester, uc_code, uc), table in data_groupped: 
        if year not in S:
            year = int(year)
            S[year] = {} 
        if semester not in S[year]:
            semester = int(semester)
            S[year][semester] = {}

        S[year][semester][uc] = {}
        class_info = table.groupby(["tipo de aula","turno","dia","hora inicio","minutos inicio", "hora fim", "minutos fim"])
                
        for (type_class, shift, day, start_hour, _, end_hour, _), _ in class_info:
            if type_class not in S[year][semester][uc]:
                S[year][semester][uc][type_class] = {}

            shift = int(shift)
            if shift not in S[year][semester][uc][type_class]:
                S[year][semester][uc][type_class][shift] = {}

            start_hour = int(start_hour)
            end_hour = int(end_hour)
            for slot in slots:
                if slot[0] == day and start_hour <= slot[1][0] and slot[1][0] < end_hour:
                    S[year][semester][uc][type_class][shift][slot] = 1
                    
    return S

def print_schedule(S):
    """
    This function prints the schedule
    """
    for year in S:
        for semester in S[year]:
            for uc in S[year][semester]:
                for type_class in S[year][semester][uc]:
                    for shift in S[year][semester][uc][type_class]:
                        slots_uc = []
                        for slot in S[year][semester][uc][type_class][shift]:
                            if S[year][semester][uc][type_class][shift][slot] == 1:
                                slots_uc.append(slot)
                        print((uc, type_class, shift, slots_uc))
        print("--------------------------------------------------")   

def generate_slots():
    """
    This function generates slots in the following way:
    (1, (9,30)) -> Day 1 (Monday), at 9:30am
    """
    slots = []

    for i in range(1,6):
        for j in range(8, 21):
            if j != 20:
                slots.append( (i, (j,0)) )
                slots.append((i, (j,30)) )
        

    return slots