import {useReducer, useState} from 'react';
import Modal from 'react-modal'

import UcEntry from './UcEntry';

export default function Trades( {studentNr, events} ){
    const [isOpen, setIsOpen] = useState(false);
    const [shiftTrade, setShiftTrade] = useState([]);
    console.log(shiftTrade);
    const customStyles = {
        overlay: {
           backgroundColor: 'rgba(0, 0, 0, 0.6)'
        },
        content: {
            height:700,
            width: 450,
            top: '50%',
            left: '50%',
            right: '50%',
            bottom: '50%',
            marginLeft: 128,
            transform: 'translate(-50%, -50%)',
            borderWidth: 2,
            borderStyle: 'solid',
            borderRadius: 15,
            borderColor: 'rgba(0,0,0,0.7)'
        }
    }

    return(
        <>
            <button type=''
                    className='float-right bg-[#1775B9] text-white pl-4 pr-4 pt-2 pb-2 mr-4 rounded-lg'
                    onClick={() => setIsOpen(!isOpen)}
            >
                Trades
            </button>
            <Modal style={customStyles} isOpen={isOpen} onRequestClose={() => setIsOpen(false)}>
                <h1 className='text-2xl font-bold text-center mb-4'>Trades</h1>
                {
                    events.map((e, index) => {
                        if(e.type_class !== "T") {
                            return (
                                <UcEntry key={index}
                                         shift={e.shift}
                                         uc={e.uc}
                                         type_class={e.type_class}
                                         setShiftTrade={setShiftTrade}/>
                            );
                        }
                    })
                }
                <div className='w-full h-auto mt-1 flex justify-center'>
                    <button className='z-10 flex w-1/3 h-auto mt-3 pt-2 text-white font-bold pb-2 justify-center bg-blue-500 hover:bg-blue-600 hover:duration-300 rounded-3xl'>
                        Submit
                    </button>
                </div>
            </Modal>
        </>
    );
}