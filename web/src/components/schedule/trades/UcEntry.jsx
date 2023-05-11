import {useEffect, useState} from 'react';
import {IoIosArrowDown} from "react-icons/io";

export default function UcEntry({shift, uc, type_class, setShiftTrade}){
    const axios = require('axios');
    let startShift = type_class+shift;

    const [isOpen, setIsOpen] = useState(false);
    const [currentShift, setCurrentShift] = useState(startShift);
    const [shifts, setShifts] = useState([]);

    useEffect(() =>{
        let params = {uc: uc, type_class: type_class};

        axios.get("api/get/shifts", {params: params})
            .then( response => setShifts(response.data.shifts));
    }, [axios, type_class, uc]);

    function handleClick(shift){
        setShiftTrade(shiftTrade => [...shiftTrade.filter( (element) => (element.uc !== uc && element.type_class.slice(0,-1) !== type_class)),
                                     {uc:uc, type_class: type_class, shift: shift}]
        );
    }
    

    return(    
        <div className='z-10 flex bg-blue-500 hover:bg-blue-600 hover:duration-300 w-full h-auto mt-2 pb-2 rounded-3xl'>
            <div className='p-2 ml-1 top-1/2 left-1/2 w-5/6'>
                <p className='font-semibold text-sm text-white'>{uc + " - " + currentShift}</p>
            </div>
            <div className='relative'>
                <button onClick={() => {setIsOpen(!isOpen)}}>
                    <IoIosArrowDown className='z-20 font-semibold text-white mt-3 ml-6' />
                </button>
                <div className={`${isOpen ? "" : "hidden"} z-30 absolute bg-white rounded border border-gray-200`}>
                    {

                        shifts.map((shift, index)=>{
                            return(
                                <button key={index} onClick={()=>{setIsOpen(!isOpen); setCurrentShift(shift); handleClick(shift)}} className='block text-sm text-black px-3 pb-1 pt-1 h-6 bg-gray-100 hover:bg-gray-300'>
                                    {shift}
                                </button>
                            );
                        })
                    }
                </div>
            </div>
        </div>
    );
}