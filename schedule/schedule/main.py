import pandas as pd

from schedule.solver import student_matrices
from schedule.solver.restrictions import restrictions
from schedule.parser import parser_schedule, parser_students
from schedule.analytics import overlap, distribution, workload

from pprint import pprint
from ortools.sat.python import cp_model

# read the data that I wrote by hand 
def read_ucs_data():
    
    csv_read = pd.read_csv(filepath_or_buffer="data/horario.csv", delimiter=',')
    data_groupped = csv_read.groupby(["uc", "ano"])

    uc_data = {}
    for (uc, year) , _ in data_groupped:
        uc_data[uc] = year

    return uc_data

def main():
    # Semester in which we are generating the schedule
    #semester = int(input("Gerar horários para o semestre: "))
    semester = 2

    students_data = parser_students.read_students_info()
    ucs_data = read_ucs_data()
    slots = parser_schedule.generate_slots()
    (S, rooms_per_slot) = parser_schedule.read_schedule_uni(ucs_data, semester, slots)
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

    slots_generated = slots
    restrictions.apply_restrictions_to_solver(model, A, P, S, semester, rooms_per_slot, rooms_capacity, slots_generated, students_data, allocated_number)
    status = solver.Solve(model)
    
    if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
        for student in A:
            student = "A95361"
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
    

    #overlap_student = overlap.calculate_overlap(solver, A, "A95361", semester)
    distr = distribution.distribution_per_uc(solver, A, "Programação Imperativa", 1, 2)
    #workload_student = workload.workload_student(solver, A, "A95361", semester)
    #pprint(overlap_student)
    pprint(distr)

if __name__ == "__main__":
    main()