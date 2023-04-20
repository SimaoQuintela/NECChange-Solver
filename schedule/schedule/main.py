import pandas as pd

from schedule.solver import student_matrices
from schedule.solver.restrictions import restrictions
from schedule.parser import parser_schedule, parser_students
from schedule.analytics import overlap, distribution, workload, roomsocupation


from pprint import pprint
from ortools.sat.python import cp_model





def read_ucs_data():
    '''
    This function reads the data in the csv file "horario.csv" and returns a structure with the year of each UC
    '''
    
    csv_read = pd.read_csv(filepath_or_buffer="data/horario.csv", delimiter=',')
    data_groupped = csv_read.groupby(["uc", "ano"])

    uc_data = {}
    for (uc, year) , _ in data_groupped:
        uc_data[uc] = year


    return uc_data


def previous_slot(slot):
    day, (hour, minutes) = slot

    if minutes == 30:
        return day, (hour, 0)
    else:
        return day, (hour-1, 30)


def next_slot(slot):
    day, (hour, minutes) = slot

    if minutes == 30:
        return day, (hour+1, 0)
    else:
        return day, (hour, 30)


def is_overlaped(slot_init, final_slot, overlap_student):
    slot = slot_init

    while(slot in overlap_student and slot != final_slot):
        if len(overlap_student[slot]) > 0:
            return "true"
        slot = next_slot(slot)
    return "false"


def one_digit_convert(dig):
    if len(str(dig)) == 1:
        return "0"+str(dig)
    return dig



def convert_A_to_JSON(A, P, S, solver):
    tabbing_student = " " * 7
    tabbing_sec = " " * 10
    tabbing_info = " " * 13
    buffer = "{\n"
    file = open("allocation.json", "w")

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
                                                    slots_buffer += f"[\"{days[slot_init[0]]}\", \"{one_digit_convert(houri)}\", \"{one_digit_convert(minutesi)}\", \"{one_digit_convert(hourf)}\", \"{one_digit_convert(minutesf)}\", {is_overlaped(slot_init, final_slot, overlap_student)}],"
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



def main():
    '''
    That's the main function. Here we can get all the schedules generated and also some analyzes about them.
    '''
    
    # Semester in which we are generating the schedule
    #semester = int(input("Gerar horários para o semestre: "))
    semester = 2

    students_data = parser_students.read_students_info()
    ucs_data = read_ucs_data()
    slots = parser_schedule.generate_slots()
    (S, rooms_per_slot) = parser_schedule.read_schedule_uni(ucs_data, semester, slots)
    parser_schedule.convert_to_JSON(S)
    rooms_capacity = parser_schedule.rooms_capacity()
    #pprint(rooms_capacity)
    #pprint(rooms_per_slot)
    stats, allocated_number = distribution.allocated_number_per_uc(students_data)
    #pprint(stats)
    model = cp_model.CpModel()
    solver = cp_model.CpSolver()

    model_matrices = student_matrices.generate_solver_matrix(students_data, S, model, semester)
    A = model_matrices[0]
    P = model_matrices[1]
    O = model_matrices[2]
    

    slots_generated = slots
    restrictions.apply_restrictions_to_solver(model, A, P, S, semester, rooms_per_slot, rooms_capacity, slots_generated, students_data, allocated_number, O)
    status = solver.Solve(model)
    
    if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
        convert_A_to_JSON(A, P, S, solver)
        for student in A:#['A94447', 'A93646', 'A95361', 'A95847']:
            #student = "A95847"#94447 #93646 #95361
            #pprint(student)
            for year in A[student]:
                for semester in A[student][year]:
                    for uc in A[student][year][semester]:
                        for type_class in A[student][year][semester][uc]:
                            for shift in A[student][year][semester][uc][type_class]:
                                for slot in A[student][year][semester][uc][type_class][shift]:
                                    if ( solver.Value(A[student][year][semester][uc][type_class][shift][slot]) == 1):
                                        slots_at_one = []
                                        for slot in A[student][year][semester][uc][type_class][shift]:
                                            if( solver.Value(A[student][year][semester][uc][type_class][shift][slot]) == 1):
                                                slots_at_one.append(slot)
                                        #print("Uc: ", uc)
                                        #print("Tipo: ", type_class)
                                        #print("Turno: ", shift)
                                        #print("Slot:", slots_at_one)
                                        #print("Alocado")
                                        break
            break
    else:
        print("No solution found")
    

    overlap_student = overlap.calculate_overlap(solver, A, "A95361", semester)
    distr = distribution.distribution_per_uc(solver, A, "Computação Gráfica", 3, 2)
    workload_student = workload.workload_student(solver, A, "A95361", semester)
    probs = distribution.distribution_probabilities(solver, A, students_data, "Programação Imperativa", 1, 2)
    rooms_ocupation = roomsocupation.rooms_ocupation(solver, S, A, rooms_per_slot, rooms_capacity, students_data, semester)
    conflicts = overlap.calculate_number_of_conflicts(solver, A, students_data, semester)
    #pprint(workload_student)
    #pprint(overlap_student)
    #pprint(rooms_ocupation)
    #pprint(probs)
    #pprint(distr)
    #pprint(conflicts)
    
    '''
    non_repeat = []
    for student in A:
        if len(list(A[student].keys())) == 1:
            non_repeat.append(student)

    for student in non_repeat:
        print("....................................")
        print(student)
        pprint(overlap.calculate_overlap(solver, A, student, semester))
    pprint(distr)
    '''
    
if __name__ == "__main__":
    main()