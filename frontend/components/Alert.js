import React from 'react';

function Alert({ alert }) {
    return <div className={`${alert ? 'flex space-x-2 justify-center items-center bg-black rounded-full p-4 w-64 fixed bottom-5 right-5 md:right-10' : 'hidden'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="white">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className='text-white font-bold'>Copied to clipboard!</p>
    </div>;
}

export default Alert;
