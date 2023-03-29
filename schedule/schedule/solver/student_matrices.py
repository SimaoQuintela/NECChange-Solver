def years_per_student(student, students_data, S, semester):
    """
    This function returns the years in which the student is enrolled.
    """
    years = set()
    for uc in students_data[student]:
        for year in range(1,4):
            if uc in S[year][semester]:
                years.add(year)

    return years

def semester_per_uc(uc, S, year, semester):
    """
    This function checks if a uc belongs to 1st or 2nd semester.
    """
    if uc in S[year][semester]:
        return semester


def slots_per_student(A, student, semester):
    slots = []

    for year in A[student]:
        for uc in A[student][year][semester]:
            for type_class in A[student][year][semester][uc]:
                for shift in A[student][year][semester][uc][type_class]:
                    for slot in A[student][year][semester][uc][type_class][shift]:
                        if slot not in slots:
                            slots.append(slot)
    return slots


def generate_solver_matrix(students_data, S, model, semester):
    """
    This function returns a matrix with solver variables assigned to the schedule of every student.
    """
    A = {} #alocar a turnos e slots
    P = {} #alocar apenas aos turnos sem slots
    O = {}

    students_nr = set(students_data.keys())

    for student in students_nr:
        A[student] = {}

        for year in years_per_student(student, students_data, S, semester):
            A[student][year] = {}
            A[student][year][semester] = {}
            for uc in students_data[student]:
                if semester_per_uc(uc, S, year, semester) == semester:
                    A[student][year][semester][uc] = {}
                    for type_class in S[year][semester][uc]:
                        A[student][year][semester][uc][type_class] = {}    
                        for shift in S[year][semester][uc][type_class]:
                            A[student][year][semester][uc][type_class][shift] = {}
                            for slot in S[year][semester][uc][type_class][shift]:
                                A[student][year][semester][uc][type_class][shift][slot] = model.NewBoolVar(f'A[{student}][{year}][{semester}][{uc}][{type_class}][{shift}][{slot}]')

    for student in students_nr:
        P[student] = {}
        for year in years_per_student(student, students_data, S, semester):
            P[student][year] = {}
            P[student][year][semester] = {}
            for uc in students_data[student]:
                if semester_per_uc(uc, S, year, semester) == semester:
                    P[student][year][semester][uc] = {}
                    for type_class in S[year][semester][uc]:
                        P[student][year][semester][uc][type_class] = {}    
                        for shift in S[year][semester][uc][type_class]:
                            P[student][year][semester][uc][type_class][shift] = model.NewBoolVar(f'P[{student}][{year}][{semester}][{uc}][{type_class}][{shift}]')

    
    for student in students_nr:
        O[student] = {}
        for slot in slots_per_student(A, student, semester):
            O[student][slot] = model.NewIntVar(0, 100, f'O[{student}][{slot}]')
       


    return (A, P, O)