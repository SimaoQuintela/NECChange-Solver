import { Calendar, momentLocalizer } from 'react-big-calendar'
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from 'moment'
import Sidebar from "@/components/Sidebar";

const localizer =  momentLocalizer(moment);

const events = [
  {
      title: "AUC - TP2",
      allDay: false,
      start: moment("2023-04-12T10:00:00").toDate(),
      end: moment("2023-04-12T12:00:00").toDate()
  },
  {
    title: "PF - TP1",
    allDay: false,
    start: moment("2023-04-12T10:00:00").toDate(),
    end: moment("2023-04-12T12:00:00").toDate()
}
]

const MyCalendar = (props) => (
  <div className="myCustomHeight">
    <Calendar
      toolbar={false}
      localizer={localizer}
      style={{height:650, margin:"50px"}}
      defaultDate={new Date()}
      defaultView={"work_week"}
      views={["day", "work_week"]}
      events={events}
    />
  </div>
)


export default function BackofficeSchedule(){
    return(
        <main>
          <div className=''>
            <Sidebar />
            <div className='relative'>
              <MyCalendar />
            </div>
          </div>
          
        </main>
    );
}