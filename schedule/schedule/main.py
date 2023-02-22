from pprint import pprint
from schedule.solver import parser_schedule, parser_students, student_alocation
from ortools.linear_solver import pywraplp

import pandas as pd 

            
def main():
    students_info = parser_students.read_students_info()
    #pprint(students_nr)

    slots = parser_schedule.generate_slots()
    schedule = parser_schedule.read_schedule_csv(slots)
    #pprint(schedule)
    #print_schedule(schedule_info)

    solver = pywraplp.Solver.CreateSolver('SCIP')
    students_nr = set(students_info.keys())
    S = student_alocation.generate_solver_matrix(schedule, students_nr, solver)
    #pprint(S)

if __name__ == "__main__":
    main()