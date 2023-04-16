import { Calendar, momentLocalizer } from 'react-big-calendar'
import Sidebar from "@/components/Sidebar";

import "react-big-calendar/lib/css/react-big-calendar.css";

import moment from 'moment'
import 'moment-timezone'

moment.tz.setDefault("Europe/Lisbon")

const localizer =  momentLocalizer(moment);

const events = [
  {
      title: "AUC - TP2",
      allDay: false,
      start: new Date("2023-04-12T10:00"),
      end: new Date("2023-04-12T12:30"),
  },
  {
    title: "PF - TP1",
    allDay: false,
    start: new Date("2023-04-12T10:00"),
      end: new Date("2023-04-12T12:30"),
}
]

function MyCalendar() {
  const minDate = new Date();
  minDate.setHours(8,0,0);

  const maxDate = new Date();
  maxDate.setHours(20,0,0);

  return(
    <div className="myCustomHeight">
      <Calendar
        toolbar={false}
        localizer={localizer}
        style={{height:650, marginTop:"30px", background: "#fff"}}
        defaultDate={new Date()}
        defaultView={"work_week"}
        views={["day", "work_week"]}
        min={minDate}
        max={maxDate}
        events={events}
        eventPropGetter={(event) => {
          const newStyle = {
            border: "solid white",
            backgroundColor: "#1775B9",
            fontWeight: "500",
            borderRadius: "12px",
            margin: "0"
          };
          return { style: newStyle };
        }}
        className='bg-white font-sans'
      />
    </div>
  );
}


export default function BackofficeSchedule(){
  return(
      <main className='h-screen bg-white '>
          <Sidebar />
          <div className='ml-64'>
            .
            <MyCalendar />
          </div>
      </main>
  );
}