
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
                        

def calculate_overlap(solver, A, student, semester):
    """
    This function returns the overlap that a student has in his schedule.
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

def student_has_conflict(student, overlap):
    """
    This function returns True if a certain student has at least 1 overlap and False otherwise.
    """
    for l in overlap.values():
        if l != []:
            return True
    return False
            

def calculate_number_of_conflicts(solver, A, students_data, semester):
    """
    This functions calculates the number of students who have conflicts in their schedule.
    """
    r = 0
    L = []
    for student in students_data:
        overlap = calculate_overlap(solver, A, student, semester)
        if student_has_conflict(student, overlap):
            L.append(student)
            r += 1
    students_nr = len(list(students_data.keys()))
    percentage = round((r/students_nr) * 100, 2)
    return L, f"{r}/{students_nr} ({percentage}% dos alunos) possuem conflitos no seu horário."

       