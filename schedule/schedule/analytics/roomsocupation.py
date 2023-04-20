

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



def year_of_uc(uc, S, semester):
    """
    This function returns the year of a specific uc.
    """

    for year in S:
        if uc in S[year][semester]:
            return year



def rooms_ocupation(solver, S, A, rooms_per_slot, rooms_capacity, students_data, semester):
    """
    This function says, for each slot, the ocupation of all rooms numerically and in percentage.
    """

    rooms_ocupation = {}

    for slot in rooms_per_slot:
        rooms_ocupation[slot] = {}
        for dic in rooms_per_slot[slot]:
            for uc in dic:
                year = year_of_uc(uc, S, semester)
                for type_class in dic[uc]:
                    for shift in dic[uc][type_class]:
                        room = dic[uc][type_class][shift]
                        students_nr = sum(solver.Value(A[student][year][semester][uc][type_class][shift][slot]) for student in students_data
                                                                                                                    if year in years_per_student(student, students_data, S, semester)
                                                                                                                    and uc in students_data[student]
                                                                                                                    )
                        stres = str(students_nr)
                        room_capacity = rooms_capacity[room]
                        percent = round((students_nr/room_capacity) * 100, 2)
                        stres+=f"/{room_capacity} -> {percent}%"
                        rooms_ocupation[slot][room] = stres


    return rooms_ocupation
                                                


