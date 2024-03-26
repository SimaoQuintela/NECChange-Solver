## Restrições aplicadas ao solver

### Restrictions

- R01 - A student can only be alocated to a class if the class exists in a certain slot.
- R02 - If a student is allocated to a class of a shift, he's allocated to that shift.
- R03 - A student can only be alocated to one shift of each type of class.
- R04 - We have a minimum number of students allocated for each shift ()
- R05 - The number of students allocated to a class must be less or equal than the room's capacity (30% tolerance)
- R06 - O[student][slot] = | classes number in slot - 1 |
- R07 - Students with ucs of only one year, must not overlap.
- R08 - In the worst case, we have an overlap of 2 ucs in a determinated slot.

### Minimizations

- Min01 - Minimization of overlaps.
