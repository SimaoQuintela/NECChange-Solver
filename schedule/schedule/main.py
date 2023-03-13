import json
from pprint import pprint
from schedule.solver import parser_schedule, parser_students, student_alocation, restrictions
from ortools.linear_solver import pywraplp
from ortools.sat.python import cp_model


def main():
    students_data = parser_students.read_students_info()
    slots = parser_schedule.generate_slots()
    S = parser_schedule.read_schedule_csv(slots)
    model = cp_model.CpModel()
    solver = cp_model.CpSolver()

    model_matrices = student_alocation.generate_solver_matrix(students_data, S, model)
    A = model_matrices[0]
    P = model_matrices[1]
    
    restrictions.apply_restrictions_to_solver(model, A, P, S)
    status = solver.Solve(model)
    
    if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
        for student in A:
            student = "A95361"
            pprint(student)
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
                                        print("Uc: ", uc)
                                        print("Tipo: ", type_class)
                                        print("Turno: ", shift)
                                        print("Slot:", slots_at_one)
                                        print("Alocado")
                                        break
            break
    else:
        print("No solution found")
    
    

if __name__ == "__main__":
    main()