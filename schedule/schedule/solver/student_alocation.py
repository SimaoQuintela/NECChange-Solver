def years_per_student(student, students_data, S):
    """
    This function returns the years in which the student is enrolled.
    """
    years = set()
    for uc in students_data[student]:
        for year in range(1,4):
            if uc in S[year][2]:
                years.add(year)

    return years

def semester_per_uc(uc, S, year):
    """
    This function checks if a uc belongs to 1st or 2nd semester.
    """
    for semestre in [1,2]:
        if uc in S[year][semestre]:
            return semestre


def generate_solver_matrix(students_data, S, solver):
    """
    This function returns a matrix with solver variables assigned to the schedule of every student.
    """
    A = {} #alocar a turnos e slots
    P = {} #alocar apenas aos turnos sem slots
    students_nr = set(students_data.keys())

    for student in students_nr:
        A[student] = {}
        for year in years_per_student(student, students_data, S):
            A[student][year] = {}
            A[student][year][2] = {}
            for uc in students_data[student]:
                if semester_per_uc(uc, S, year) == 2:
                    A[student][year][2][uc] = {}
                    for type_class in S[year][2][uc]:
                        A[student][year][2][uc][type_class] = {}    
                        for shift in S[year][2][uc][type_class]:
                            A[student][year][2][uc][type_class][shift] = {}
                            for slot in S[year][2][uc][type_class][shift]:
                                A[student][year][2][uc][type_class][shift][slot] = solver.BoolVar(f'S[{student}][{year}][{2}][{uc}][{type_class}][{shift}][{slot}]')   
    

    for student in students_nr:
        P[student] = {}
        for year in years_per_student(student, students_data, S):
            P[student][year] = {}
            P[student][year][2] = {}
            for uc in students_data[student]:
                if semester_per_uc(uc, S, year) == 2:
                    P[student][year][2][uc] = {}
                    for type_class in S[year][2][uc]:
                        P[student][year][2][uc][type_class] = {}    
                        for shift in S[year][2][uc][type_class]:
                            P[student][year][2][uc][type_class][shift] = solver.BoolVar(f'P[{student}][{year}][{2}][{uc}][{type_class}][{shift}]')


    return (A, P)