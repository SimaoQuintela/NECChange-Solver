import React from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

interface ModalProps {
  show: boolean;
  close: () => void;
  students: string[];
}

const Modal: React.FC<ModalProps> = ({ show, close, students }) => {
  if (!show) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={close}
    >
      <div
        className="bg-white p-6 rounded-lg max-w-md w-full"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">Alunos com sobreposição</h2>
        <ul className="max-h-96 overflow-y-auto">
          {students.length === 0 ? (
            <li className="text-gray-500">Nenhum aluno encontrado.</li>
          ) : (
            students.map(num => (
              <li key={num} className="py-1 border-b">
                <Link
                //quero ir para a página do schedule
                  href={`/schedule`}
                  className="text-blue-600 hover:underline"
                  onClick={close}
                > 
                  {num}
                </Link>
              </li>
            ))
          )}
        </ul>
        <button
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          onClick={close}
        >
          Fechar
        </button>
      </div>
    </div>,
    document.body
  );
};

export default Modal;