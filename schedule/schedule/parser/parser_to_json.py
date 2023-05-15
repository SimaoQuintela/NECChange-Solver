from schedule.analytics import overlap


def previous_slot(slot):
    '''
    This function returns the previous slot of a certain slot
    '''
    day, (hour, minutes) = slot

    if minutes == 30:
        return day, (hour, 0)
    else:
        return day, (hour-1, 30)


def next_slot(slot):
    '''
    This function returns the next slot of a certain slot
    '''
    day, (hour, minutes) = slot

    if minutes == 30:
        return day, (hour+1, 0)
    else:
        return day, (hour, 30)


def is_overlaped(slot_init, final_slot, overlap_student):
    '''
    This function says if we have a overlap in a certain slot of a specific studen
    '''
    slot = slot_init

    while(slot in overlap_student and slot != final_slot):
        if len(overlap_student[slot]) > 0:
            return "true"
        slot = next_slot(slot)
    return "false"



def one_digit_convert(dig):
    '''
    This function puts one digit numbers to two digit numbers. Example: 9 -> 09 but 11 -> 11
    '''
    if len(str(dig)) == 1:
        return "0"+str(dig)
    return dig
    

def search_room(uc, type_class, shift, aux):
    '''
    This function returns the room of a certain class
    '''
    for dic in aux:
        if uc in dic:
            if type_class in dic[uc]:
                if shift in dic[uc][type_class]:
                    return dic[uc][type_class][shift]


def convert_A_to_JSON(A, P, S, rooms_per_slot, solver):
    '''
    This functions converts our allocation matrix into a JSON file
    '''
    tabbing_student = " " * 7
    tabbing_sec = " " * 10
    tabbing_info = " " * 13
    buffer = "{\n"
    file = open("../../web/public/data/alocation.json", "w")

    days = {
            1: "Segunda",
            2: "Terça",
            3: "Quarta",
            4: "Quinta",
            5: "Sexta"
    }



    for student in A:
            buffer += tabbing_student
            buffer += f"\"{student}\" : [ \n"
            for year in A[student]:
                for semester in A[student][year]:
                    for uc in A[student][year][semester]:
                        if uc != "Projeto":
                            overlap_student = overlap.calculate_overlap(solver, A, student, semester)
                            for type_class in A[student][year][semester][uc]:
                                for shift in A[student][year][semester][uc][type_class]:
                                    if(solver.Value(P[student][year][semester][uc][type_class][shift]) == 1):
                                        buffer += tabbing_sec                  
                                        buffer += "{\n"
                                        buffer += tabbing_info
                                        buffer += f"\"uc\" : \"{uc}\",\n"
                                        buffer += tabbing_info
                                        buffer += f"\"year\" : \"{year}\",\n"
                                        buffer += tabbing_info
                                        buffer += f"\"semester\" : \"{semester}\",\n"
                                        buffer += tabbing_info
                                        buffer += f"\"type_class\" : \"{type_class}\",\n"
                                        buffer += tabbing_info
                                        buffer += f"\"shift\" : \"{shift}\",\n"
                                        buffer += tabbing_info
                                        buffer += f"\"slots\" : ["
                                        slots_buffer = ""
                                        for slot in S[year][semester][uc][type_class][shift]:
                                                if(previous_slot(slot) not in S[year][semester][uc][type_class][shift]):
                                                    slot_init = slot
                                                    dayi, (houri, minutesi) = slot_init
                                                    while(slot in S[year][semester][uc][type_class][shift]):
                                                        slot = next_slot(slot)
                                                    final_slot = slot
                                                    dayf, (hourf, minutesf) = final_slot
                                                    aux = [dic for dic in rooms_per_slot[slot_init]]
                                                    room = search_room(uc, type_class, shift, aux)
                                                    room_str = f"Ed{room[0]}-{room[1]}"
                                                    slots_buffer += f"[\"{days[slot_init[0]]}\", \"{one_digit_convert(houri)}\", \"{one_digit_convert(minutesi)}\", \"{one_digit_convert(hourf)}\", \"{one_digit_convert(minutesf)}\", \"{room_str}\", {is_overlaped(slot_init, final_slot, overlap_student)}],"
                                        buffer += slots_buffer
                                        buffer = buffer[:-1]
                                        buffer += "]\n"
                                        buffer += tabbing_sec
                                        buffer += "},\n"  
            buffer = buffer[:-2]
            buffer += "\n"
            buffer += tabbing_student
            buffer += "],\n"
    buffer = buffer[:-2]
    buffer += "\n"
    buffer += "}\n"

    file.write(buffer)
    file.close()




def convert_S_to_JSON(S):
    '''
    This function returns a JSON file with the schedule information
    '''
    tabbing = " " * 7
    buffer = "[\n"

    days = {
            1: "Segunda",
            2: "Terça",
            3: "Quarta",
            4: "Quinta",
            5: "Sexta"
    }

    file = open("../../web/public/data/schedule.json", "w")

    for year in S:
        for semester in S[year]:
            for uc in S[year][semester]:
                for type_class in S[year][semester][uc]:
                    for shift in S[year][semester][uc][type_class]:
                        buffer += "   {\n"
                        buffer += tabbing
                        buffer += f"\"uc\" : \"{uc}\",\n"
                        buffer += tabbing
                        buffer += f"\"year\" : \"{year}\",\n"
                        buffer += tabbing
                        buffer += f"\"semester\" : \"{semester}\",\n"
                        buffer += tabbing
                        buffer += f"\"type_class\" : \"{type_class}\",\n"
                        buffer += tabbing
                        buffer += f"\"shift\" : \"{shift}\",\n"
                        buffer += tabbing
                        buffer += f"\"slots\" : ["
                        slots_buffer = ""
                        for slot in S[year][semester][uc][type_class][shift]:
                            if(previous_slot(slot) not in S[year][semester][uc][type_class][shift]):
                                slot_init = slot
                                dayi, (houri, minutesi) = slot_init
                                while(slot in S[year][semester][uc][type_class][shift]):
                                    slot = next_slot(slot)
                                final_slot = slot
                                dayf, (hourf, minutesf) = final_slot
                                slots_buffer += f"[\"{days[slot_init[0]]}\", \"{houri}\", \"{minutesi}\", \"{hourf}\", \"{minutesf}\"],"
                        buffer += slots_buffer
                        buffer = buffer[:-1]
                        buffer += "]\n   },\n"


    buffer = buffer[:-2]
    buffer += "\n]"



    file.write(buffer)
    file.close()