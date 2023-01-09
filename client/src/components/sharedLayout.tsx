import React from 'react';
import {Outlet} from 'react-router-dom';
import Bridge from '../tools/bridge';

export default function signup() {


  const initDB = async  ()=>{
    const res = await Bridge.create('initDB');
    console.log(res)
  }

  return (
    <>
      <header className='fixed top-0 right-0 left-0 z-10 text-white'>
        <ul className='backdrop-blur-xl h-[3rem] flex items-center gap-3 px-5'>
          <li className='ml-auto'>profile</li>
          <li>login</li>
          <li>signup</li>
          <li><button onClick={initDB}>initDB</button></li>
        </ul>
      </header>
        <Outlet/>
      <div aria-label='footer'></div>
    </>
  );
}
