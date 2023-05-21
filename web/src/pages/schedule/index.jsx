import Sidebar from "@/components/Sidebar";
import Schedule from '@/components/schedule/calendar/Schedule';
import Trades from "@/components/schedule/trades/Trades";

import {useState} from 'react';

import "react-big-calendar/lib/css/react-big-calendar.css";


function getDates(slot){
  let date = new Date();
  date.toLocaleString('pt', { timeZone: 'Europe/Lisbon' });
  let year = date.getFullYear();
  
  let month = date.getMonth()+1;
  if(month < 10){
    month = "0"+month;
  }

  let week = {
    "Segunda": 1,
    "Terça": 2,
    "Quarta": 3,
    "Quinta": 4,
    "Sexta": 5
  }
  // dia da aula = (dia do mês + dia da aula - dia da semana atual) % numero de dias do mês
  let days_in_month = new Date(year, month,0).getDate();
  let day = (date.getDate()+ week[slot[0]] - date.getDay()) % days_in_month;
  if(day < 10){
    day = "0"+day;
  }
  let start = new Date(year+"-"+month+"-"+day + "T" + slot[1]+":"+ slot[2]);
  let end = new Date(year+"-"+month+"-"+day+"T"+slot[3]+":"+ slot[4]);

  return {"start": start, "end": end}
}

function handleEvents(data) {
  let events = [];
  Object.values(data.classes).map((lesson) => {
    lesson.slots.map((slot) => {
      let dates = getDates(slot) ;
      let event = {
        "title" : lesson.type_class + lesson.shift + " - " + lesson.uc + " - " + slot[5],
        "year": lesson.year,
        "semester": lesson.semester,
        "uc": lesson.uc,
        "type_class": lesson.type_class,
        "shift": lesson.shift,
        "allDay": false,
        "overlap": slot[6],
        "start": dates.start,
        "end": dates.end
      };
      events.push(event);
    });
  });
  return events
}


export default function BackofficeSchedule(){
  const [studentNr, setStudentNr] = useState('');
  const [evt, setEvt] = useState([]);
  const axios = require('axios');

  const getSchedule = () => {
    axios.get('api/get/'+studentNr)
    .then(response => {
      let evts = handleEvents(response.data);
      setEvt(evts);
      console.log({"200": "Ok"})
    })
    .catch((error) =>{
      setEvt([])
      if(error.response) console.log(error.response)
      else if(error.request) console.log(error.request)
      else console.log({"Error": error.message})
      console.log(error.config)
    } )
  };

  return(
      <main className='h-screen bg-white '>
        <Sidebar />
        <div className='ml-64 pt-8'>
          <div className='w-full h-auto'>
            <input type="text"
                   className='rounded-lg'
                   value={studentNr}
                   onChange={(e) => setStudentNr(e.target.value)}
                   placeholder='Student number'
            />
            <button type=''
                    className='bg-[#1775B9] text-white pl-4 pr-4 pt-2 pb-2 ml-2 rounded-lg'
                    onClick={getSchedule}>
              Search
            </button>
            <Trades studentNr={studentNr} events={evt} getSchedule={getSchedule}/>
          </div>
          <Schedule events={evt} />
        </div>
      </main>
  );
}