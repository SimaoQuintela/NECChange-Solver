def apply_restrictions_to_solver(model, A, P, S, semester, rooms_per_slot, rooms_capacity):
    """
    This function applies restrictions to solver
    """

    # R01 - A student can only be alocated to a class if the class exists in a certain slot
    for student in A:
        for year in A[student]:
            for uc in A[student][year][semester]:
                for type_class in A[student][year][semester][uc]:
                    for shift in A[student][year][semester][uc][type_class]:
                        for slot in A[student][year][semester][uc][type_class][shift]:
                            model.Add(
                                A[student][year][semester][uc][type_class][shift][slot]
                                <=
                                S[year][semester][uc][type_class][shift][slot]
                            )
    

    #R02 - A student can only be alocated to one shift of each type of class
    for student in A:
        for year in A[student]:
            for uc in A[student][year][semester]:
                for type_class in A[student][year][semester][uc]:
                    for shift in A[student][year][semester][uc][type_class]:
                        for slot in A[student][year][semester][uc][type_class][shift]:
                            model.Add(
                                P[student][year][semester][uc][type_class][shift]
                                ==
                                A[student][year][semester][uc][type_class][shift][slot]
                            )

    
    for student in P:
        for year in P[student]:
            for uc in P[student][year][semester]:
                for type_class in P[student][year][semester][uc]:
                    shifts = P[student][year][semester][uc][type_class]
                    model.Add(
                        sum(P[student][year][semester][uc][type_class][shift] for shift in shifts)
                            ==
                            1
                        )

    # R03 - The nr of students alocated to a class must be less or equal than the room's capacity 
    for student in A:
        for year in A[student]:
            for uc in A[student][year][semester]:
                for type_class in A[student][year][semester][uc]:
                    for shift in A[student][year][semester][uc][type_class]:
                        for slot in A[student][year][semester][uc][type_class][shift]:
                            x = 0






    # Min01 - Minimização do número de sobreposições
    Aux = {}
    for student in A:
        Aux[student] = {}
        for year in A[student]:
            for uc in A[student][year][semester]:
                for type_class in A[student][year][semester][uc]:
                    for shift in A[student][year][semester][uc][type_class]:
                        for slot in A[student][year][semester][uc][type_class][shift]:
                            if slot not in Aux[student]:
                                Aux[student][slot] = list()
                            Aux[student][slot].append(A[student][year][semester][uc][type_class][shift][slot])

    for student in Aux:
        for slot in Aux[student]:
            model.Minimize(sum(Aux[student][slot]))
    
    