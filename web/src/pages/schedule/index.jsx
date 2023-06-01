import Sidebar from "@/components/Sidebar";
import Schedule from '@/components/schedule/calendar/Schedule';
import Trades from "@/components/schedule/trades/Trades";
import Head from "next/head";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import alocation from '../../../public/data/alocation.json';
import axios from 'axios';
import { saveAs } from 'file-saver';


import {useState, useEffect} from 'react';

import JSZip from 'jszip';

import "react-big-calendar/lib/css/react-big-calendar.css";

const exportToPDF = () => {
  const input = document.getElementById('calendarContainer');
  html2canvas(input)
      .then((canvas) => {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'mm', 'a4'); // A4 size page of PDF
          var width = pdf.internal.pageSize.getWidth();
          var height = pdf.internal.pageSize.getHeight();

          height = canvas.height * width / canvas.width;
          
          pdf.addImage(imgData, 'PNG', 0, 0, width, height); // parameters: data, format, x, y, width, height
          pdf.save("download.pdf");  
      });
};




const exportAllToPDF = async (studentList, setStudentNr, getScheduleFn) => {
  const zip = new JSZip();

  for (const studentNr of studentList) {
    // Set the student number
    setStudentNr(studentNr);

    // Trigger the search
    await getScheduleFn();

    // Wait for the schedule to be displayed
    await new Promise(resolve => setTimeout(resolve, 1000));

    const input = document.getElementById('calendarContainer');
    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4'); // A4 size page of PDF
    var width = pdf.internal.pageSize.getWidth();
    var height = pdf.internal.pageSize.getHeight();

    height = canvas.height * width / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, width, height); // parameters: data, format, x, y, width, height

    // add the PDF data to the ZIP file
    zip.file(`${studentNr}.pdf`, pdf.output('blob'));
  }

  // generate the ZIP file and trigger a download
  zip.generateAsync({ type: 'blob' }).then((content) => {
    saveAs(content, 'schedules.zip');
  });
};






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


export default function BackofficeSchedule() {
  const [studentNr, setStudentNr] = useState('');
  const [evt, setEvt] = useState([]);

  const getSchedule = () => {
    axios.get('api/get/' + studentNr)
      .then(response => {
        let evts = handleEvents(response.data);
        setEvt(evts);
        console.log({ "200": "Ok" });
      })
      .catch((error) => {
        setEvt([]);
        if (error.response) console.log(error.response);
        else if (error.request) console.log(error.request);
        else console.log({ "Error": error.message });
        console.log(error.config);
      });
    console.log(studentNr);
  };

  useEffect(() => {
    getSchedule();
  }, [studentNr]);

  const studentNumbers = Object.keys(alocation);

  const exportAllSchedules = () => {
    exportAllToPDF(studentNumbers, setStudentNr, getSchedule);
  };

  return(
      <main className='h-screen bg-white '>
        <Head>
          <title>NECChange</title>
          <link rel="icon" href="logos/necc-blue.svg" />

        </Head>
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
          <button className='bg-[#1775B9] text-white pl-4 pr-4 pt-2 pb-2 ml-2 rounded-lg mt-2' onClick={exportToPDF}>Export to PDF</button>

          <button className='bg-[#1775B9] text-white pl-4 pr-4 pt-2 pb-2 ml-2 rounded-lg ' onClick={exportAllSchedules}>Export All to PDF</button>
        </div>
      </main>
  );
}