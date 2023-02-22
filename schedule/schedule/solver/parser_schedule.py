import pandas as pd

def read_schedule_csv(slots):
    schedule = {}
    csv_read = pd.read_csv("data/horario.csv")
    data_groupped = csv_read.groupby(["ano","semestre","código da uc","uc"])
    
    for (year, semester, uc_code, uc), table in data_groupped: 
        if year not in schedule:
            year = int(year)
            schedule[year] = {} 
        if semester not in schedule[year]:
            semester = int(semester)
            schedule[year][semester] = {}

        schedule[year][semester][uc] = {}
        class_info = table.groupby(["tipo de aula","turno","dia","hora inicio","minutos inicio", "hora fim", "minutos fim"])
                
        for (type_class, shift, day, start_hour, _, end_hour, _), _ in class_info:
            if type_class not in schedule[year][semester][uc]:
                schedule[year][semester][uc][type_class] = {}

            shift = int(shift)
            if shift not in schedule[year][semester][uc][type_class]:
                schedule[year][semester][uc][type_class][shift] = {}

            start_hour = int(start_hour)
            end_hour = int(end_hour)
            for slot in slots:
                if slot[0] == day and start_hour <= slot[1][0] and slot[1][0] < end_hour:
                    schedule[year][semester][uc][type_class][shift][slot] = 1
                    
    return schedule

def print_schedule(schedule_info):
    for year in schedule_info:
        for semester in schedule_info[year]:
            for uc in schedule_info[year][semester]:
                for type_class in schedule_info[year][semester][uc]:
                    for shift in schedule_info[year][semester][uc][type_class]:
                        slots_uc = []
                        for slot in schedule_info[year][semester][uc][type_class][shift]:
                            if schedule_info[year][semester][uc][type_class][shift][slot] == 1:
                                slots_uc.append(slot)
                        print((uc, type_class, shift, slots_uc))
        print("--------------------------------------------------")   

def generate_slots():
    slots = []

    for i in range(1,6):
        for j in range(8, 21):
            slots.append( (i, (j,0)) )
            slots.append((i, (j,30)) )

    slots.pop()
    return slots