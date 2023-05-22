import os
import pandas as pd

from schedule.solver import student_matrices
from schedule.solver.restrictions import restrictions
from schedule.parser import parser_schedule, parser_students, parser_to_json
from schedule.analytics import overlap, distribution, workload, roomsocupation

from pprint import pprint
from ortools.sat.python import cp_model

def read_ucs_data():
    '''
    This function reads the data in the csv file "uc_years.csv" and returns a structure with the year of each UC
    '''
    
    if(os.path.relpath(__file__) == "main.py"):
        path = "data/uc_years.csv"
    else:
        path = "./../schedule/schedule/data/uc_years.csv"

    csv_read = pd.read_csv(filepath_or_buffer=path, delimiter=',')
    
    data_groupped = csv_read.groupby(["uc", "ano"])

    uc_data = {}
    for (uc, year) , _ in data_groupped:
        uc_data[uc] = year


    return uc_data



def parser(opt):
    '''
    This function removes the spaces from the number input and converts aXXXXX or only XXXXX to AXXXXX which is our dictionary key.
    '''
    res = (opt.replace(" ", "")).upper()
    if res[0] != 'A':
        res = "A" + res
    return res


def menu(solver, A, S, students_data, rooms_per_slot, rooms_capacity, semester):
    '''
    This function show for the cliente a menu with our analytics functions
    '''
    
    print("\n\n\n\nDATA ANALYSIS MENU")

    while True:
        print("\n\n\n\nChoose an option:\n")
        print("1 - Overlaps for a specific student.")
        print("2 - Distribution of shifts for a specific UC.")
        print("3 - Daily workload for a specific student.")
        print("4 - Probability distribution of shifts for a specific UC.")
        print("5 - Rooms ocupation in each slot.")
        print("6 - Student with conflicts in their schedule.")
        print("7 - Number of students allocated for each UC.")
        print("9 - Leave Menu\n\n") 
        option = int(input("Option: "))
        if option >= 8: break
        elif option == 1:
            inside_opt = str(input("Number of student: "))
            inside_opt = parser(inside_opt)
            pprint(overlap.calculate_overlap(solver, A, inside_opt, semester))
        elif option == 2:
            year = int(input("Year (numerically) of UC: "))
            print("\n")
            list_aux = list(S[year][semester].keys())
            for i, uc in enumerate(list_aux):
                print(f"{i+1} - {uc}")
            print("\n")
            inside_opt = int(input("Option: "))
            pprint(distribution.distribution_per_uc(solver, A, list_aux[inside_opt-1], year, semester))
        elif option == 3:
            inside_opt = str(input("Number of student: "))
            inside_opt = parser(inside_opt)
            pprint(workload.workload_student(solver, A, inside_opt, semester))
        elif option == 4:
            year = int(input("Year (numerically) of UC: "))
            print("\n")
            list_aux = list(S[year][semester].keys())
            for i, uc in enumerate(list_aux):
                print(f"{i+1} - {uc}")
            print("\n")
            inside_opt = int(input("Option: "))
            pprint(distribution.distribution_probabilities(solver, A, students_data, list_aux[inside_opt-1], year, semester))
        elif option == 5:
            pprint(roomsocupation.rooms_ocupation(solver, S, A, rooms_per_slot, rooms_capacity, students_data, semester))
        elif option == 6:
            pprint(overlap.calculate_number_of_conflicts(solver, A, students_data, semester))
        elif option == 7:
            pprint(distribution.allocated_number_per_uc(students_data)[0])




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
    parser_to_json.convert_S_to_JSON(S, rooms_per_slot)
    rooms_capacity = parser_schedule.rooms_capacity()
    stats, allocated_number = distribution.allocated_number_per_uc(students_data)
    
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
        
        parser_to_json.convert_A_to_JSON(A, P, S, rooms_per_slot, solver)

        for student in A:
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
        if(os.path.relpath(__file__) == "main.py"):
            menu(solver, A, S, students_data, rooms_per_slot, rooms_capacity, semester)
    else:
        print("No solution found")
    
    
    



if __name__ == "__main__":
    main()
