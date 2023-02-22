

def anos_por_aluno(student, students_data, schedule):
    years = set()

    for uc in students_data[student]:
        for year in range(1,4):
            if uc in schedule[year][2]:
                years.add(year)

    return years

def semestre_por_uc(uc, schedule, year):

    for semestre in [1,2]:
        if uc in schedule[year][semestre]:
            return semestre




def generate_solver_matrix(students_data, schedule, students, solver):
    """
    This function returns a matrix with solver variables assigned to the schedule of every student
    """
    s = {}

    for student in students:
        s[student] = {}
        for year in anos_por_aluno(student, students_data, schedule):
            s[student][year] = {}
            s[student][year][2] = {}
            for uc in students_data[student]:
                if semestre_por_uc(uc, schedule, year) == 2:
                    s[student][year][2][uc] = {}
                    for type_class in schedule[year][2][uc]:
                        s[student][year][2][uc][type_class] = {}    
                        for shift in schedule[year][2][uc][type_class]:
                            s[student][year][2][uc][type_class][shift] = {}
                            for slot in schedule[year][2][uc][type_class][shift]:
                                s[student][year][2][uc][type_class][shift][slot] = solver.BoolVar(f'S[{student}][{year}][{2}][{uc}][{type_class}][{shift}][{slot}]')   


    return s
