from ortools.sat.python import cp_model

from schedule.solver import student_matrices
from schedule.solver.restrictions import restrictions
from schedule.parser import parser_schedule, parser_students
from schedule.analytics import overlap, distribution, workload, allocatedperuc

from pprint import pprint



def main():
    # Semester in which we are generating the schedule
    semester = 2

    students_data = parser_students.read_students_info()
    slots = parser_schedule.generate_slots()
    S = parser_schedule.read_schedule_csv(slots)
    model = cp_model.CpModel()
    solver = cp_model.CpSolver()

    model_matrices = student_matrices.generate_solver_matrix(students_data, S, model, semester)
    A = model_matrices[0]
    P = model_matrices[1]
    
    restrictions.apply_restrictions_to_solver(model, A, P, S, semester)
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
    

    overlap_student = overlap.calculate_overlap(solver, A, "A95361", semester)
    distr = distribution.distribution_per_uc(solver, A, "Álgebra Universal e Categorias", 2, 2)
    workload_student = workload.workload_student(solver, A, "A95361", semester)
    allocated_number = allocatedperuc.allocated_number(students_data)
    #pprint(overlap_student)
    pprint(allocated_number)

if __name__ == "__main__":
    main()