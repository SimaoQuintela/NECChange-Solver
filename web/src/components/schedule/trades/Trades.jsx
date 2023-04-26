import { useState } from 'react';
//import { Button, Modal, ModalBody, ModalFooter } from "reactstrap";
import Modal from 'react-modal'
import {IoIosArrowDown} from "react-icons/io";

export default function Trades( {studentNr, events} ){
    const [isOpen, setIsOpen] = useState(false);
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
                    // take a look on this index, may cause bugs
                    events.map((e, index) => {
                        if(e.type_class !== "T") {
                            return (
                                <div key={index} className='flex bg-blue-500 w-full h-auto mt-2 rounded-3xl'>
                                    <div className='p-2 ml-1 top-1/2 left-1/2 w-5/6'>
                                        <p className='font-semibold text-white'>{e.title}</p>
                                    </div>
                                    <button className='flex justify-end w-1/6 m-auto pr-4 '>
                                        <IoIosArrowDown className='font-semibold text-white' />
                                    </button>
                                </div>
                            );
                        }
                    })
                }
            </Modal>
        </>
    );
}