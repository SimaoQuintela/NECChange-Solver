
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
                        

def calculate_overlap(solver, A, student, semester):
    """
    This function returns the overlap that a student has in his schedule
    """

    overlap = {}

    for slot in slots_per_student(A, student, semester):
        if slot not in overlap:
            overlap[slot] = list()
        for year in A[student]:
            for uc in A[student][year][semester]:
                if uc != "Projeto":
                    for type_class in A[student][year][semester][uc]:
                        for shift in A[student][year][semester][uc][type_class]:
                            if slot in A[student][year][semester][uc][type_class][shift]:
                                if(solver.Value(A[student][year][semester][uc][type_class][shift][slot]) == 1):
                                    overlap[slot].append((uc, type_class, shift))
        
        if len(overlap[slot]) == 1:
            overlap[slot] = []
    

    return overlap