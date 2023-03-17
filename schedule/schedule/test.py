from pprint import pprint
import pandas as pd
import re
from schedule.parser import parser_schedule

days = {
    "Segunda" : 1,
    "Terça" : 2,
    "Quarta" : 3,
    "Quinta" : 4,
    "Sexta" : 5
}


# read the data that university sent us
def read_schedule_uni(ucs_data):
    slots = parser_schedule.generate_slots()
    csv_read = pd.read_csv(filepath_or_buffer="data/uni_data/horario.csv", delimiter=';')
    data_groupped = csv_read.groupby(["ModuleName", "ModuleAcronym", "ModuleCode"])

    semester = 2
    uc_acronyms = {}
    rooms = {}
    S = {}

    for (moduleName, moduleAcronym, _), table in data_groupped:
        uc_acronyms[moduleName] = moduleAcronym

        year = ucs_data[moduleName] 
        if year not in S:
            S[year] = {}
            S[year][semester] = {}
        if moduleAcronym not in S[year][semester]:
            S[year][semester][moduleAcronym] = {}

        rooms[moduleAcronym] = {}

        #pprint(table)
        uc_data = table.groupby(["Typology", "SectionName", "Classroom", "NumStudents" ,"WeekdayName", "StartTime", "EndTime"])

        for (type_class, shift, room, capacity, day, start, end) , _ in uc_data :
            if type_class not in rooms[moduleAcronym]:
                rooms[moduleAcronym][type_class] = {}
            
            shift = int(shift[-1])
            if shift not in rooms[moduleAcronym][type_class]:
                rooms[moduleAcronym][type_class][shift] = {}

            room = re.findall('([0-9]+) \- ([0-9-]+\.[0-9]+)', room)[0]
            if room not in rooms[moduleAcronym][type_class][shift]:
                rooms[moduleAcronym][type_class][shift][room] = {}

            rooms[moduleAcronym][type_class][shift][room] = {}

            if type_class not in S[year][semester][moduleAcronym]:
                S[year][semester][moduleAcronym][type_class] = {}

            if shift not in S[year][semester][moduleAcronym][type_class]: 
                S[year][semester][moduleAcronym][type_class][shift] = {}

            time_regex = "([0-9]+)\:[0-9]+"
            start_hour = re.findall(time_regex, start)[0]
            end_hour = re.findall(time_regex, end)[0]

            start_hour = int(start_hour)
            end_hour = int(end_hour)

            for slot in slots:
                if slot[0] == days[day] and start_hour <= slot[1][0] and slot[1][0] < end_hour:
                    S[year][semester][moduleAcronym][type_class][shift][slot] = 1

    pprint(S)
    pprint(rooms)

# read the data that I wrote by hand 
def read_schedule_mine():
    
    csv_read = pd.read_csv(filepath_or_buffer="data/horario.csv", delimiter=',')
    data_groupped = csv_read.groupby(["uc", "ano"])

    uc_data = {}
    for (uc, year) , _ in data_groupped:
        uc_data[uc] = year

    return uc_data

ucs_data = read_schedule_mine()
read_schedule_uni(ucs_data)
