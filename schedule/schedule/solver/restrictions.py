from schedule.solver import student_alocation
from numpy import prod



def apply_restrictions_to_solver(solver, A, P, M, S, students_data, slots):
    """
    This function applies restrictions to solver
    """
    students_nr = set(students_data.keys())

    # R01 - A student can only be alocated to a class if the class exists in a certain slot
    for student in A:
        for year in A[student]:
            for uc in A[student][year][2]:
                for type_class in A[student][year][2][uc]:
                    for shift in A[student][year][2][uc][type_class]:
                        for slot in A[student][year][2][uc][type_class][shift]:
                            solver.Add(
                                A[student][year][2][uc][type_class][shift][slot]
                                <=
                                S[year][2][uc][type_class][shift][slot]
                            )
    

    #R02 - A student can only be alocated to one shift of each type of class
    for student in A:
        for year in A[student]:
            for uc in A[student][year][2]:
                for type_class in A[student][year][2][uc]:
                    for shift in A[student][year][2][uc][type_class]:
                        for slot in A[student][year][2][uc][type_class][shift]:
                            solver.Add(
                                P[student][year][2][uc][type_class][shift]
                                ==
                                A[student][year][2][uc][type_class][shift][slot]
                            )

    
    for student in P:
        for year in P[student]:
            for uc in P[student][year][2]:
                for type_class in P[student][year][2][uc]:
                    shifts = P[student][year][2][uc][type_class]
                    solver.Add(
                        sum(P[student][year][2][uc][type_class][shift] for shift in shifts)
                            ==
                            1
                        )

    #adicionar restriçao da matriz M (matriz a minimizar) basicamente preencher a matriz M com o numero de aulas nesse slot para um dado aluno M[student][slot] = nr aulas desse aluno nesse slot
                        
    '''
    for student in M:
        for slot in M[student]:
            solver.Minimize(M[student][slot])
    '''
                       

    

