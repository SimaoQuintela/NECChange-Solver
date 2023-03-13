def apply_restrictions_to_solver(model, A, P, S):
    """
    This function applies restrictions to solver
    """

    # R01 - A student can only be alocated to a class if the class exists in a certain slot
    for student in A:
        for year in A[student]:
            for uc in A[student][year][2]:
                for type_class in A[student][year][2][uc]:
                    for shift in A[student][year][2][uc][type_class]:
                        for slot in A[student][year][2][uc][type_class][shift]:
                            model.Add(
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
                            model.Add(
                                P[student][year][2][uc][type_class][shift]
                                ==
                                A[student][year][2][uc][type_class][shift][slot]
                            )

    
    for student in P:
        for year in P[student]:
            for uc in P[student][year][2]:
                for type_class in P[student][year][2][uc]:
                    shifts = P[student][year][2][uc][type_class]
                    model.Add(
                        sum(P[student][year][2][uc][type_class][shift] for shift in shifts)
                            ==
                            1
                        )

    
    # Min01 - Minimização do número de sobreposições
    Aux = {}
    for student in A:
        Aux[student] = {}
        for year in A[student]:
            for uc in A[student][year][2]:
                for type_class in A[student][year][2][uc]:
                    for shift in A[student][year][2][uc][type_class]:
                        for slot in A[student][year][2][uc][type_class][shift]:
                            if slot not in Aux[student]:
                                Aux[student][slot] = list()
                            Aux[student][slot].append(A[student][year][2][uc][type_class][shift][slot])

    for student in Aux:
        for slot in Aux[student]:
            model.Minimize(sum(Aux[student][slot]))
    
    