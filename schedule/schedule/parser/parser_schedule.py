import os
from pprint import pprint
import pandas as pd
import re
from schedule.parser import parser_schedule


days = {
       "Segunda": 1,
       "Terça": 2,
       "Quarta": 3,
       "Quinta": 4,
       "Sexta": 5
        }


# read the data that university sent us
def read_schedule_uni(ucs_data, semester, slots):
    """
    This function reads the schedule of the course for a certain semester and returns the room assigned for each class.

    Return:
        - rooms is a dictionary with the rooms for each UC, for each Type of Class and for each Shift
        - S is the dictionary that represents the schedule. It has the following structure:  Year -> Semester -> UcName -> Type Class -> Shift -> Slot -> 1/0.
        If the last value is set to 1 it means that there's a class at that slot.
        An example can be: 3 -> 2 -> Computação Gráfica -> PL -> 2 -> (1, (10, 30)) -> 1.
        This means that on monday at 10.30am there's a class of Computação Gráfica assigned to PL2.
    """

    slots = parser_schedule.generate_slots()
    path_compare = os.path.join("parser", "parser_schedule.py")
    if(os.path.relpath(__file__) == path_compare):
        path = os.path.join("data", "uni_data", "horario.csv")
    else:
        path = os.path.join(".", "..", "schedule", "schedule", "data", "uni_data", "horario.csv")
    csv_read = pd.read_csv(filepath_or_buffer=path, delimiter=';')
    data_groupped = csv_read.groupby(["ModuleName", "ModuleAcronym", "ModuleCode"])

    rooms_per_slot = {}
    S = {}


    for (moduleName, moduleAcronym, _), table in data_groupped:
            year = ucs_data[moduleName] 
            if year not in S:
                S[year] = {}
                S[year][semester] = {}
            if moduleName not in S[year][semester]:
                S[year][semester][moduleName] = {}

            uc_data = table.groupby(["Typology", "SectionName", "Classroom", "NumStudents" ,"WeekdayName", "StartTime", "EndTime"])

            for (type_class, shift, room, _, day, start, end) , _ in uc_data :
                shift = int(shift[-1])

                room = re.findall('([0-9]+) \- ([0-9-]+\.[0-9]+)', room)[0]
                
                if type_class not in S[year][semester][moduleName]:
                    S[year][semester][moduleName][type_class] = {}

                if shift not in S[year][semester][moduleName][type_class]: 
                    S[year][semester][moduleName][type_class][shift] = {}

                time_regex = "([0-9]+)\:[0-9]+"
                start_hour = re.findall(time_regex, start)[0]
                end_hour = re.findall(time_regex, end)[0]

                start_hour = int(start_hour)
                end_hour = int(end_hour)


                
                for slot in slots:
                    if slot[0] == days[day] and start_hour <= slot[1][0] and slot[1][0] < end_hour:
                        S[year][semester][moduleName][type_class][shift][slot] = 1
                        aux_room = {}
                        aux_room[moduleName] = {}
                        aux_room[moduleName][type_class] = {}
                        aux_room[moduleName][type_class][shift] = room
                        if slot not in rooms_per_slot:
                            rooms_per_slot[slot] = list()
                        rooms_per_slot[slot].append(aux_room)
    
    return (S, rooms_per_slot)




def rooms_capacity():
    """
    This function creates a structure with the capacity of each room.
    """
    
    path_compare = os.path.join("parser","parser_schedule.py")
    if(os.path.relpath(__file__) == path_compare):
        path = os.path.join("data", "uni_data", "salas.csv")
    else:
        path = os.path.join(".", "..", "schedule", "schedule", "data", "uni_data", "salas.csv")
    csv_read = pd.read_csv(filepath_or_buffer=path, delimiter=';')
    groupped_by_building = csv_read.groupby("Edificio")


    rooms_capacity = {}
    for (building), table in groupped_by_building:
        room_data = table.groupby(["Espaço", "Capacidade Aula"])
        for (room_nr, capacity), _ in room_data:
            room_nr = str(room_nr)
            # pandas truncates 0.20 to 0.2
            if room_nr[-2] == ".":
                room_nr += "0"
            rooms_capacity[(str(building), room_nr)] = int(capacity)


    
                    

    return rooms_capacity



def print_schedule(S):
    """
    This function prints the schedule of all classes.
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
                slots.append((i, (j,0)) )
                slots.append((i, (j,30)) )
        

    return slots