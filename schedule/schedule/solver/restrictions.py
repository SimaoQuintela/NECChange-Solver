from schedule.solver import student_alocation
from numpy import prod


def nrslots_per_shift(year, uc, type_class, shifts, S):
    res = []
    
    for shift in shifts:
        nrslots = len(list(S[year][2][uc][type_class][shift].keys()))
        res.append(nrslots)
    
    
    tam = len(res)
    for i in range(5-tam):   #4-1-2
       res += [res[0]]             
                        

    return res

def apply_restrictions_to_solver(solver, A, P, S, students_data, slots):
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

    # R02 - The result of allocating a student to a class should be the same in all slots                     
    for student in A:
        for year in A[student]:
            for uc in A[student][year][2]:
                for type_class in A[student][year][2][uc]:
                    for shift in A[student][year][2][uc][type_class]:
                        slots = list(A[student][year][2][uc][type_class][shift].keys())
                        solver.Add(
                            (sum(A[student][year][2][uc][type_class][shift][slot] for slot in slots) == len(slots))
                            or
                            (sum(A[student][year][2][uc][type_class][shift][slot] for slot in slots) == 0) 
                        )
    
    

    # definir matriz somatorio
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


    #R03 - A student can only be alocated to one shift of each type of class
    for student in P:
        for year in P[student]:
            for uc in P[student][year][2]:
                for type_class in P[student][year][2][uc]:
                    shifts = list(P[student][year][2][uc][type_class].keys())
                    solver.Add(
                        sum([P[student][year][2][uc][type_class][shift] for shift in shifts])
                            ==
                            1
                        )
                        


                       

    

