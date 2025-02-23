import { Calendar, momentLocalizer } from 'react-big-calendar'
import 'moment-timezone'
import moment from 'moment'
import '@/styles/Home.module.css'
import { EventCalendarI } from '@/types/Types'

moment.tz.setDefault("Europe/Lisbon")

const localizer = momentLocalizer(moment);


export default function Schedule({ events }: { events: EventCalendarI[] }) {
  const minDate = new Date();
  minDate.setHours(8, 0, 0);

  const maxDate = new Date();
  maxDate.setHours(20, 0, 0);

  return (
    <div>
      <Calendar
        toolbar={false}
        localizer={localizer}
        style={{ height: "80vh", marginTop: "10px", borderRadius: "8px", background: "#fff" }}
        defaultDate={new Date()}
        defaultView={"work_week"}
        views={["day", "work_week"]}
        min={minDate}
        max={maxDate}
        events={events}
        eventPropGetter={(event) => {
          console.log(event)
          let color = "";

          // If the event is overlapping with another event the color is gray
          if (event.overlap === true) {
            color = "#A0A0A0";
          } else {
            if (event.year === "1") {
              
              // If the class is a theoretical class the color is blue, otherwise it is light blue
              if (event.type_class === "T") color = "#0066CC";
              else color = "#3f6bcc";

            } else if (event.year === "2") {

              // If the class is a theoretical class the color is red, otherwise it is orange
              if (event.type_class === "T") color = "#ff291d";
              else color = "#ff540e";

            } else if (event.year === "3") {

              // If the class is a theoretical class the color is green, otherwise it is light green
              if (event.type_class === "T") color = "#4C9900";
              else color = "#00990e";

            }
          }

          const newStyle = {
            border: "solid",
            borderColor: "white",
            borderWidth: "2px",
            backgroundColor: color,
            fontWeight: "",
            borderRadius: "6px",
            margin: "0px",
          };
          return { style: newStyle };
        }}
        className='bg-white font-sans'
      />
    </div>
  );
}
