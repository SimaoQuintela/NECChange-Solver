import os
import matplotlib.pyplot as plt
import json
import zipfile


def create_schedule(student_id, schedule_data):
    # Initialize the table
    days = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"]
    times = [
        "8h-9h",
        "9h-10h",
        "10h-11h",
        "11h-12h",
        "12h-13h",
        "13h-14h",
        "14h-15h",
        "15h-16h",
        "16h-17h",
        "17h-18h",
        "18h-19h",
        "19h-20h",
    ]
    table = [["" for _ in range(5)] for _ in range(12)]
    overlaps = {}

    # Get the schedule data for the student
    student_schedule = schedule_data.get(student_id, [])

    # Populate the table with the student's schedule data
    uc_years = set()  # To store the distinct years of UCs in the schedule
    for entry in student_schedule:
        uc_year = int(entry["year"])
        uc_years.add(uc_year)  # Add the year of the UC to the set
        for slot in entry["slots"]:
            day = days.index(slot[0])
            start_time = int(slot[1]) - 8
            end_time = int(slot[3]) - 8
            course = "".join(filter(str.isupper, entry["uc"]))
            type_class = entry["type_class"]
            shift = entry["shift"]
            room = slot[5]  # Room information
            slot_info = (
                f"{course} {type_class}{shift} ({room})"  # Modified slot information
            )

            # Check for overlapping slots
            for i in range(start_time, end_time):
                if table[i][day] != "":
                    if (i, day) in overlaps:
                        overlaps[(i, day)].append(slot_info)
                    else:
                        overlaps[(i, day)] = [table[i][day], slot_info]
                table[i][day] = slot_info

    # Mark overlapping slots with combined information
    for overlap, info in overlaps.items():
        i, day = overlap
        existing_info = "/".join(info)
        table[i][day] = existing_info

    # Create the table as a plot with increased size and colors
    fig, ax = plt.subplots(figsize=(12, 8))
    ax.axis("off")
    cell_colors = [["white" for _ in range(5)] for _ in range(12)]
    color_map = {
        "1": "#CCCCFF",
        "2": "#FFCCCC",
        "3": "#CCFFCC",
    }  # Color mapping for each year
    light_color_map = {
        "1": "#5656ff",
        "2": "#FF4343",
        "3": "#56FF56",
    }  # Lighter color mapping for TP and PL
    for entry in student_schedule:
        uc_year = int(entry["year"])
        for slot in entry["slots"]:
            day = days.index(slot[0])
            start_time = int(slot[1]) - 8
            end_time = int(slot[3]) - 8
            for i in range(start_time, end_time):
                if (i, day) in overlaps:  # Check if the slot is overlapping
                    cell_colors[i][day] = "lightgray"  # Change the color to light gray
                elif entry["type_class"] in [
                    "TP",
                    "PL",
                ]:  # Check if the type_class is TP or PL
                    cell_colors[i][day] = light_color_map.get(
                        str(uc_year), "white"
                    )  # Use the light color for TP or PL
                else:
                    cell_colors[i][day] = color_map.get(str(uc_year), "white")

    table = ax.table(
        cellText=table,
        cellColours=cell_colors,
        cellLoc="center",
        loc="center",
        colLabels=days,
        rowLabels=times,
    )
    table.scale(2, 2)  # Increase the row height for better readability
    table.auto_set_font_size(False)  # Disable automatic font size adjustment

    for cell in table.get_celld().values():
        cell.set_fontsize(12)  # Set the font size of the cells

    # Set the title as the student number
    ax.set_title(student_id)

    # Create the folder if it doesn't exist

    if os.path.relpath(__file__) == "export_students_schedule.py":
        folder_path = "students_schedule_png"
    else:
        folder_path = os.path.join(".", "..", "schedule", "schedule", "students_schedule_png")
    os.makedirs(folder_path, exist_ok=True)

    # Save the plot as a PNG image in the folder
    filename = os.path.join(folder_path, f"schedule_{student_id}.png")
    plt.savefig(filename, bbox_inches="tight", pad_inches=0.4)
    plt.close()


# Load the schedule data from the JSON file

if os.path.relpath(__file__) == "export_students_schedule.py":
    data_path = os.path.join(".", "..", "..", "web", "public", "data", "alocation.json")
else:
    data_path = os.path.join(".", "..", "web", "public", "data", "alocation.json")

with open(data_path) as file:
    schedule_data = json.load(file)

# Generate schedules for each student
for student_id in schedule_data:
    create_schedule(student_id, schedule_data)

# Create a zip file containing all the schedule images

# with zipfile.ZipFile("student_schedules.zip", "w") as zip_file:
#     for student_id in schedule_data:
#         filename = os.path.join("schedules", f"schedule_{student_id}.png")
#         zip_file.write(filename)
