import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import Bridge from '../tools/bridge';

export default function signup() {
  const initDB = async () => {
    const res = await Bridge.create('initDB');
    console.log(res);
  };

  const loggedInUser = '';

  const tailwindClasses = {
    linkHover: 'hover:pb-1 hover:border-b-2 hover:border-b-primary',
    linkActive: 'pb-1 border-b-2 border-b-primary'
  }

  const activeLink = ({
    isActive,
    isPending,
  }: {
    isActive: boolean;
    isPending: boolean;
  }) => (isActive ? tailwindClasses.linkActive : tailwindClasses.linkHover);

  return (
    <>
      <style>{`.active{color: red}`}</style>
      <header className='fixed top-0 right-0 left-0 z-10 text-white'>
        <ul className='backdrop-blur-xl h-[3rem] flex items-center gap-3 px-5'>
          <li className='ml-auto'>
            <NavLink to={`/user/${loggedInUser}`} className={activeLink}>
              profile
            </NavLink>
          </li>
          <li>
            <NavLink to='/login' className={activeLink}>login</NavLink>
          </li>
          <li>
            <NavLink to='/signup' className={activeLink}>signup</NavLink>
          </li>
          <li>
            <button onClick={initDB} className='border-2 border-primary rounded-lg p-1'>initDB</button>
          </li>
        </ul>
      </header>
      <Outlet />
      <div aria-label='footer'></div>
    </>
  );
}
