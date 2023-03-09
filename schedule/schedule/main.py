from pprint import pprint
from schedule.solver import parser_schedule, parser_students, student_alocation, restrictions
from ortools.linear_solver import pywraplp


def main():
    students_data = parser_students.read_students_info()

    slots = parser_schedule.generate_slots()
    S = parser_schedule.read_schedule_csv(slots)
    #pprint(S)
    
    solver = pywraplp.Solver.CreateSolver('SCIP')
    tupl = student_alocation.generate_solver_matrix(students_data, S, solver)
    A = tupl[0]
    P = tupl[1]
    M = tupl[2]

    #pprint(A)
    #pprint(S)
    #pprint(P)
    
    restrictions.apply_restrictions_to_solver(solver, A, P, M, S, students_data, slots)
    status = solver.Solve()
    
    if status == pywraplp.Solver.OPTIMAL:
        for student in A:
            pprint(student)
            #student = "A94447"
            for year in A[student]:
                for semester in A[student][year]:
                    for uc in A[student][year][semester]:
                        for type_class in A[student][year][semester][uc]:
                            for shift in A[student][year][semester][uc][type_class]:
                                for slot in A[student][year][semester][uc][type_class][shift]:
                                    if ( A[student][year][semester][uc][type_class][shift][slot].solution_value() == 1):
                                        slots_at_one = []
                                        for slot in A[student][year][semester][uc][type_class][shift]:
                                            if(A[student][year][semester][uc][type_class][shift][slot].solution_value() == 1):
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