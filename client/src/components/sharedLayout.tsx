import React from 'react';
import { Outlet, NavLink, useLocation, Navigate } from 'react-router-dom';
import Bridge from '../tools/bridge';
import {
  FaUser,
  FaUserPlus,
  FaSignInAlt,
  FaSignOutAlt,
  FaSuitcase,
  FaLightbulb,
  FaList,
  FaHatWizard
} from 'react-icons/fa';

type loggedInUserT = {
  username: string;
  id: string;
};

export default function signup() {
  const [isLoggedInState, setIsLoginState] = React.useState<
    undefined | boolean
  >(undefined);
  const [loggedInUserState, setLoggedInUserState] = React.useState<
    loggedInUserT | {}
  >({});
  const rLocation = useLocation();

  const checkLogin = async () => {
    const res: {
      err?: any;
      loginStatus: boolean;
      loggedInUser: loggedInUserT;
    } = await Bridge('read', 'isLogin');
    if (!res?.err) {
      setIsLoginState(res.loginStatus);
      setLoggedInUserState(res.loggedInUser);
      return;
    }
    setIsLoginState(false);
  };

  React.useEffect(() => {
    checkLogin();
  }, []);

  // redirecting
  const authenticating: boolean =
    rLocation.pathname == '/login' || rLocation.pathname == '/signup';
  if (isLoggedInState != undefined) {
    if (isLoggedInState && authenticating) {
      return <Navigate to={`/user/${loggedInUserState?.username}`}></Navigate>;
    }

    if (!isLoggedInState && !authenticating) {
      return <Navigate to='/login'></Navigate>;
    }
  }

  const initDB = async () => {
    const res = await Bridge('post', 'initDB');
    console.log(res);
  };


  const logout = async () => {
    const res = await Bridge('post', 'logout');
    console.log(res);
  };

  const tailwindClasses = {
    link: 'text-white hover:bg-white hover:text-primary',
    // the pseudo is temperary
    linkActive: `bg-white text-primary 
                relative before:absolute after:absolute
                before:border-[15px] before:border-r-white before:border-b-transparent
                before:border-t-transparent before:border-l-transparent
                before:top-0 before:right-0 before:translate-y-[-50%] before:translate-x-[20%]
                after:border-[15px] after:border-t-white after:border-b-transparent
                after:border-r-transparent after:border-l-transparent
                after:bottom-0 after:right-0 after:translate-y-[100%] after:translate-x-[70%]
                `,
    navItem: 'pb-1 flex gap-2 items-center px-2 py-1',
  };

  const activeLink = ({
    isActive,
  }: {
    isActive: boolean;
    isPending: boolean;
  }) => (isActive
      ? `${tailwindClasses.navItem} ${tailwindClasses.linkActive}` 
      : `${tailwindClasses.navItem} ${tailwindClasses.link}`
  );

  const listNavItems = () => {
    if (isLoggedInState) {
      return (
        <>
          <li>
            <NavLink
              to={`/user/${loggedInUserState?.username}`}
              className={activeLink}
            >
              <FaUser />
              profile
            </NavLink>
          </li>
          <li>
            <NavLink to={`/portfolios`} 
              className={activeLink}
            >
              <FaSuitcase />
              portfolios
            </NavLink>
          </li>
          <li>
            <NavLink to={`/projects`}
              className={activeLink}
            >
              <FaLightbulb />
             projects 
            </NavLink>
          </li>
          <li>
            <NavLink to={`/tasks`}
              className={activeLink}
            >
              <FaList />
              tasks
            </NavLink>
          </li>
          <li>
            <button
              onClick={logout}
              className={`${tailwindClasses.navItem} ${tailwindClasses.link} w-full`}
            >
              <FaSignOutAlt />
              logout
            </button>
          </li>
        </>
      );
    }

    return (
      <>
        <li>
          <NavLink to='/login'
              className={activeLink}
            >
            <FaSignInAlt />
            login
          </NavLink>
        </li>
        <li>
          <NavLink to='/signup'
              className={activeLink}
            >
            <FaUserPlus />
            signup
          </NavLink>
        </li>
      </>
    );
  };

  return isLoggedInState != undefined ? (
    <>
      <header className='py-5 bg-primary text-white w-[10rem]'>
        <ul className='backdrop-blur-xl h-[3rem] flex flex-col gap-3'>
          {listNavItems()}

          <li>
            <button
              onClick={initDB}
              className={`${tailwindClasses.navItem} ${tailwindClasses.link} w-full`}
            >
              <FaHatWizard/>
              initDB
            </button>
          </li>
        </ul>
      </header>
      {/*
       */}
      <Outlet context={{ isLoggedIn: isLoggedInState }} />
      <div aria-label='footer'></div>
    </>
  ) : (
    <>redirecting to home</>
  );
}
