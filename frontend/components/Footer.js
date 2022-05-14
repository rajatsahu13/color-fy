import React from 'react';

function Footer() {
    return (
        <div className='flex justify-between items-center p-4 md:p-8 bg-black'>
            <span className='text-xl md:text-4xl text-white tracking-widest font-black select-none'>&copy; color.fy</span>
            <a href='https://github.com/rajatsahu13/color-fy' target={'_blank'} rel="noreferrer" className='text-xl md:text-4xl text-white uppercase tracking-wide font-black cursor-pointer'>Github</a>
        </div>
    );
}

export default Footer;
