import React from 'react';
import { Outlet, NavLink, useLocation, Navigate } from 'react-router-dom';
import Bridge from '../tools/bridge';

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
  const location = useLocation();

  const checkLogin = async () => {
    const res: {
      err?: any;
      loginStatus: boolean;
      loggedInUser: loggedInUserT;
    } = await Bridge('get', 'isLogin');
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
    location.pathname == '/login' || location.pathname == '/signup';
  if (isLoggedInState != undefined) {
    if (isLoggedInState && authenticating) {
      return <Navigate to='/'></Navigate>;
    }

    if (!isLoggedInState && !authenticating) {
      return <Navigate to='/login'></Navigate>;
    }
  }

  const initDB = async () => {
    const res = await Bridge('post', 'initDB');
    console.log(res);
  };

  const tailwindClasses = {
    linkHover: 'hover:pb-1 hover:border-b-2 hover:border-b-primary',
    linkActive: 'pb-1 border-b-2 border-b-primary',
  };

  const activeLink = ({
    isActive,
  }: {
    isActive: boolean;
    isPending: boolean;
  }) => (isActive ? tailwindClasses.linkActive : tailwindClasses.linkHover);

  // don't render the shared layout wheither the state is ready or false
  return isLoggedInState != undefined ? (
    <>
      <style>{`.active{color: red}`}</style>
      <header className='fixed top-0 right-0 left-0 z-10 text-white'>
        <ul className='backdrop-blur-xl h-[3rem] flex items-center gap-3 px-5'>
          <li className='ml-auto'>
            <NavLink to={`/user/${loggedInUserState?.username}`} className={activeLink}>
              profile
            </NavLink>
          </li>
          {isLoggedInState ? (
            <></>
          ) : (
            <>
              <li>
                <NavLink to='/login' className={activeLink}>
                  login
                </NavLink>
              </li>
              <li>
                <NavLink to='/signup' className={activeLink}>
                  signup
                </NavLink>
              </li>
            </>
          )}
          <li>
            <button
              onClick={initDB}
              className='border-2 border-primary rounded-lg p-1'
            >
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
