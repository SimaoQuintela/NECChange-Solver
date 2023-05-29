import { Calendar, momentLocalizer } from 'react-big-calendar'
import 'moment-timezone'
import moment from 'moment'

moment.tz.setDefault("Europe/Lisbon")

const localizer =  momentLocalizer(moment);


export default function Schedule({ events }) {
  const minDate = new Date();
  minDate.setHours(8,0,0);

  const maxDate = new Date();
  maxDate.setHours(20,0,0);

  return(
    <div className="myCustomHeight">
      <Calendar
        toolbar={false}
        localizer={localizer}
        style={{height:700, marginTop:"20px", background: "#fff"}}
        defaultDate={new Date()}
        defaultView={"work_week"}
        views={["day", "work_week"]}
        min={minDate}
        max={maxDate}
        events={events}
        eventPropGetter={(event) => {
          console.log(event)
          let color="";
          if(event.overlap === true){
              color = "#A0A0A0";
          } else {
              if(event.year === "1"){
                  if(event.type_class === "T") color = "#0066CC";
                  else color = "#3f6bcc";
              } else if(event.year === "2"){
                  if(event.type_class === "T") color = "#ff291d";
                  else color = "#ff540e";
              } else if(event.year === "3"){
                  if(event.type_class === "T") color = "#4C9900";
                  else color = "#00990e";
              }
          }

          const newStyle = {
            border: "solid white",
            backgroundColor: color,
            fontWeight: "500",
            borderRadius: "12px",
            margin: "0",
            opacity: 1
          };
          return { style: newStyle };
        }}
        className='bg-white font-sans'
      />
    </div>
  );
}
