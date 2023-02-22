from pprint import pprint

import pandas as pd 


def read_csv_info():
    """
    this function reads a csv in the following format:
    {
        year1: { uc1: [list of students enrolled], uc2: [list of students enrolled]},
        ..., 
        yearN: { uc1_2: [list of students enrolled], uc2_2: [list of students enrolled]}
    }
    """
    csv_read = pd.read_csv("data/inscritos_anon.csv")
    data_groupped = csv_read.groupby(["Ano Curricular da UC","Código da UC", "Unidade Curricular"])["Nº Mecanográfico"]
    
    course_data = {}
    ucs = set()
    # nota: alterar isto, usar uc_code como chave em vez de uc_name
    for (uc_year, uc_code, uc_name) , enrolled_students in data_groupped:
        ucs.add(uc_name)
        if uc_year not in course_data:
            course_data[uc_year] = {}
        
        course_data[uc_year][uc_name] = {}
        course_data[uc_year][uc_name] = list(enrolled_students)

    
    return (course_data, ucs)
    
def generate_slots():
    slots = []

    for i in range(1,6):
        for j in range(8, 21):
            slots.append( (i, (j,0)) )
            slots.append((i, (j,30)) )

    slots.pop()
    return slots

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
                in_class = 0
                if slot[0] == day and start_hour <= slot[1][0] and slot[1][0] < end_hour:
                    in_class = 1
                
                schedule[year][semester][uc][type_class][shift][slot] = in_class
    return schedule
             
            
def main():
    ucs_data = read_csv_info()
    slots = generate_slots()
    schedule_info = read_schedule_csv(slots)

    for uc in schedule_info[3][2]:
        for type_class in schedule_info[3][2][uc]:
            for shift in schedule_info[3][2][uc][type_class]:
                slots_uc = []
                for slot in schedule_info[3][2][uc][type_class][shift]:
                    if schedule_info[3][2][uc][type_class][shift][slot] == 1:
                        slots_uc.append(slot)
                print((uc, type_class, shift, slots_uc))
    #pprint(schedule_info)
    #pprint(ucs_data)

if __name__ == "__main__":
    main()