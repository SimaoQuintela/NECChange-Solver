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



def ucs_from_only_one_year(student, students_data, S, semester):
    """
    This function returns True if a certain student has UC's of only one year and False otherwise.
    """
    years = set()
    for uc in students_data[student]:
        for year in range(1,4):
            if uc in S[year][semester]:
                years.add(year)
    if len(years) == 1:
        return True
    return False




def slots_per_student(A, student, semester):
    """
    This function returns all the slots of all ucs from a specific student.
    """
    slots = []

    for year in A[student]:
        for uc in A[student][year][semester]:
            for type_class in A[student][year][semester][uc]:
                for shift in A[student][year][semester][uc][type_class]:
                    for slot in A[student][year][semester][uc][type_class][shift]:
                        if slot not in slots:
                            slots.append(slot)
    return slots
                      

def apply_restrictions_to_solver(model, A, P, S, semester, rooms_per_slot, rooms_capacity, slots_generated, students_data, allocated_number, O):
    """
    This function applies restrictions to solver.
    """

    # R01 - A student can only be alocated to a class if the class exists in a certain slot.

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
    

    # R02 - If a student is allocated to a class of a shift, he's allocated to that shift.
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

    #R03 - A student can only be alocated to one shift of each type of class
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
    

    #R04 - We have a minimum number of students allocated for each shift
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
                                >= aux - int(allocated_number_of_uc*0.1)
                        )
    

    # R05 - The number of students allocated to a class must be less or equal than the room's capacity (30% tolerance)
    
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
                                                    int(rooms_capacity[room]/0.7)
                                                )
    
    # R06 - O[student][slot] = | classes number in slot - 1 |
    for student in O:
            for slot in O[student]:
                model.AddAbsEquality(O[student][slot],
                    (sum([ A[student][year][semester][uc][type_class][shift][slot] for year in years_per_student(student, students_data, S, semester)
                                                                                for uc in students_data[student] 
                                                                                if uc in S[year][semester] and uc != "Projeto"
                                                                                for type_class in A[student][year][semester][uc]
                                                                                for shift in A[student][year][semester][uc][type_class]
                                                                                if slot in S[year][semester][uc][type_class][shift]
                    ])-1)
                    )

    
    #R07 - Students with ucs of only one year, must not overlap.
    for student in O:
        if ucs_from_only_one_year(student, students_data, S, semester):
            for slot in O[student]:
                model.Add(
                    sum([ A[student][year][semester][uc][type_class][shift][slot] for year in years_per_student(student, students_data, S, semester)
                                                                                for uc in students_data[student] 
                                                                                if uc in S[year][semester] and uc != "Projeto"
                                                                                for type_class in A[student][year][semester][uc]
                                                                                for shift in A[student][year][semester][uc][type_class]
                                                                                if slot in S[year][semester][uc][type_class][shift]
                    ])
                    <=
                    1
                    )

    
    #R08 - In the worst case, we have an overlap of 2 ucs in a determinated slot.
    for student in O:
            for slot in O[student]:
                    model.Add(O[student][slot]
                    <=
                    1
                    )
    
    

    # Min01 - Minimization of overlaps.
   
    for student in O:
        for slot in O[student]:
            model.Minimize(O[student][slot])
