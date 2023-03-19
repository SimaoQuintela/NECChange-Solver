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

def apply_restrictions_to_solver(model, A, P, S, semester, rooms_per_slot, rooms_capacity, slots_generated, students_data, allocated_number):
    """
    This function applies restrictions to solver
    """

    # R01 - A student can only be alocated to a class if the class exists in a certain slot

    students_nr = set(students_data.keys())


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

    # R03 - A certain shift must have a minimum number of students allocated (total students allocated of uc / nr of shifts - 5(tolerance)
    for year in range(1,4):
        for uc in S[year][semester]:
            allocated_number_of_uc = allocated_number[uc]
            for type_class in S[year][semester][uc]:
                shift_number = int(len(list(S[year][semester][uc][type_class].keys())))
                for shift in S[year][semester][uc][type_class]:
                    aux = int(allocated_number_of_uc / shift_number)
                    model.Add(
                        sum(P[student][year][semester][uc][type_class][shift] for student in students_nr
                                                                            if year in years_per_student(student, students_data, S, semester)
                                                                            and uc in students_data[student]
                                                                            and semester_per_uc(uc, S, year, semester) == semester
                                                                            )
                                >= aux-5
                                
                        )


    # R04 - The nr of students alocated to a class must be less or equal than the room's capacity (30% tolerance)
    
    for slot in slots_generated:
        for year in S:
            for uc in S[year][semester]:
                for type_class in S[year][semester][uc]:
                    for shift in S[year][semester][uc][type_class]:
                        if slot in S[year][semester][uc][type_class][shift]:
                            for dic in rooms_per_slot[slot]:
                                if uc in dic:
                                    if type_class in dic[uc]:
                                        if shift in dic[uc][type_class]:
                                            room = dic[uc][type_class][shift]
                                            model.Add(
                                                sum(A[student][year][semester][uc][type_class][shift][slot] for student in students_nr
                                                                                                            if year in years_per_student(student, students_data, S, semester)
                                                                                                            and uc in students_data[student]
                                                                                                            and semester_per_uc(uc, S, year, semester) == semester
                                                                                                            and slot in A[student][year][semester][uc][type_class][shift])
                                                    <= 
                                                    rooms_capacity[room] + int(allocated_number[uc]*0.3)
                                                )

                            



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
    
    
