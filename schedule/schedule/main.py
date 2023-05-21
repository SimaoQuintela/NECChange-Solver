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
    This function reads the data in the csv file "horario.csv" and returns a structure with the year of each UC
    '''
    
    if(os.path.relpath(__file__) == "main.py"):
        path = "data/horario.csv"
    else:
        path = "./../schedule/schedule/data/horario.csv"

    csv_read = pd.read_csv(filepath_or_buffer=path, delimiter=',')
    
    data_groupped = csv_read.groupby(["uc", "ano"])

    uc_data = {}
    for (uc, year) , _ in data_groupped:
        uc_data[uc] = year


    return uc_data



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
    parser_to_json.convert_S_to_JSON(S)
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
    
    
if __name__ == "__main__":
    main()