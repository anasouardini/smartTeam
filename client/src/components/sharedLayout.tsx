import React from 'react';
import { Outlet, NavLink, useLocation, useNavigate, Navigate } from 'react-router-dom';
import Bridge from '../tools/bridge';
import toUrlEncoded from '../tools/toUrlEncoded';
import {
  FaUser,
  FaUserPlus,
  FaSignInAlt,
  FaSignOutAlt,
  FaSuitcase,
  FaLightbulb,
  FaList,
  FaKey,
  FaHatWizard,
  FaBars,
} from 'react-icons/fa';
import { VscChromeClose } from 'react-icons/vsc';

import {toast} from 'react-toastify';

type loggedInUserT = {
  username: string;
  id: string;
};

// TODO: add tooltips for the icons

export default function sharedLayout() {
  const routerNavigate = useNavigate();
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

      if(rLocation.pathname == '/' && res?.loggedInUser?.username){
        routerNavigate(`/user/${res.loggedInUser.username}`);
      }

      return;
    }
    setIsLoginState(false);
  };

  React.useEffect(() => {
    checkLogin();
  }, []);

  const menuRefs = React.useRef<{
    expanded: boolean;
    nav: HTMLElement | null;
    logo: HTMLElement | null;
    xIcon: HTMLElement | null;
    barsIcon: HTMLElement | null;
  }>({
    expanded: false,
    nav: null,
    logo: null,
    xIcon: null,
    barsIcon: null,
  }).current;

  // TODO: menu doesn't work in projects(overflowed width) page
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
    const res = await Bridge('post', `initDB`);
    // console.log(res);
    toast.info(res.data);
  };

  const logout = async () => {
    const res = await Bridge('post', `logout`);
    // console.log(res);
    toast.info(res);
  };

  const loginAs = async ({usr, passwd}:{usr:string, passwd: string})=>{
    // if(isLoggedInState){
    //   logout({params:{swithingAccounts: true}});
    // }
    const response = await Bridge('post', 'login', {
      switchingAccounts: true,
      username: usr,
      password: passwd,
    });
  }
  
  // minimizing not hiding
  const toggleMenu = () => {
    if (
      !(menuRefs.nav && menuRefs.logo && menuRefs.xIcon && menuRefs.barsIcon)
    ) {
      return;
    }

    if (menuRefs.expanded) {
      if(document.querySelector('#table-container')){
        document.querySelector('#table-container').style.width = 'calc(100vw - 2.2rem - 0.5rem - 40px)';
      }
      
      menuRefs.nav.style.marginLeft = '.5rem';
      menuRefs.nav.style.marginTop = '.5rem';
      menuRefs.nav.style.marginBottom = '.5rem';

      menuRefs.nav.style.width = '2.2rem';
      menuRefs.nav.style.minWidth = '2.2rem'; //TODO: temp solution
      menuRefs.nav.style.borderRadius = '10px';
      menuRefs.logo.style.display = 'none';
      menuRefs.xIcon.style.display = 'none';
      menuRefs.barsIcon.style.display = 'inline';

      menuRefs.expanded = false;
      return;
    }
    if(document.querySelector('#table-container')){
      document.querySelector('#table-container').style.width = 'calc(100vw - 10rem - 40px)'
    }
    menuRefs.nav.style.marginLeft = '0';
    menuRefs.nav.style.marginTop = '0';
    menuRefs.nav.style.marginBottom = '0';

    menuRefs.nav.style.width = '10rem';
    menuRefs.nav.style.minWidth = '10rem'; //TODO: temp solution
    menuRefs.nav.style.borderRadius = '0';
    menuRefs.logo.style.display = 'inline';
    menuRefs.xIcon.style.display = 'inline';
    menuRefs.barsIcon.style.display = 'none';

    menuRefs.expanded = true;
  };

  const tailwindClasses = {
    link: 'text-white hover:bg-white hover:text-primary',
    // linkActive: `bg-white text-primary
    //             relative before:absolute after:absolute
    //             before:border-[15px] before:border-r-white before:border-b-transparent
    //             before:border-t-transparent before:border-l-transparent
    //             before:top-0 before:right-0 before:translate-y-[-50%] before:translate-x-[20%]
    //             after:border-[15px] after:border-t-white after:border-b-transparent
    //             after:border-r-transparent after:border-l-transparent
    //             after:bottom-0 after:right-0 after:translate-y-[100%] after:translate-x-[70%]
    //             `,
    linkActive: `bg-white text-primary
                relative before:absolute after:absolute
                `,
    navItem: 'pb-1 flex gap-3 items-center px-2 py-1',
  };

  const activeLink = ({
    isActive,
  }: {
    isActive: boolean;
    isPending: boolean;
  }) =>
    isActive
      ? `${tailwindClasses.navItem} ${tailwindClasses.linkActive}`
      : `${tailwindClasses.navItem} ${tailwindClasses.link}`;

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
            <NavLink to={`/portfolios`} className={activeLink}>
              <FaSuitcase />
              portfolios
            </NavLink>
          </li>
          <li>
            <NavLink to={`/projects`} className={activeLink}>
              <FaLightbulb />
              projects
            </NavLink>
          </li>
          <li>
            <NavLink to={`/tasks`} className={activeLink}>
              <FaList />
              tasks
            </NavLink>
          </li>
          <li>
            <NavLink to={`/privileges`} className={activeLink}>
              <FaKey />
              privileges
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
          <NavLink to='/login' className={activeLink}>
            <FaSignInAlt />
            login
          </NavLink>
        </li>
        <li>
          <NavLink to='/signup' className={activeLink}>
            <FaUserPlus />
            signup
          </NavLink>
        </li>
      </>
    );
  };

  return isLoggedInState != undefined ? (
    <>
      {/*aria-expanded would not makes sense here*/}
      <nav
        ref={(el) => (menuRefs.nav = el)}
        className={`bg-primary text-white overflow-hidden hover:overflow-visible
                  ml-[.5rem] my-[.5rem] rounded-[10px] w-[2.1rem] min-w-[2.1rem] `}
      >
        <div className='text-2xl py-4 flex justify-between'>
          <span ref={(el) => (menuRefs.logo = el)} className='pl-3 hidden'>
            LOGO
          </span>
          <button
            aria-label='menu minmize button'
            className={`cursor-pointer mr-2 pl-[5px]`}
            onClick={toggleMenu}
          >
            <span ref={(el) => (menuRefs.barsIcon = el)} className='inline'>
              <FaBars />
            </span>
            <span className={`hidden`} ref={(el) => (menuRefs.xIcon = el)}>
              <VscChromeClose />
            </span>
          </button>
        </div>
        <ul className='h-[3rem] flex flex-col gap-3 min-w-min'>
          {listNavItems()}
            <ul
            className={`${tailwindClasses.navItem} ${tailwindClasses.link} w-full relative cursor-pointer`}
              onMouseOver={(e) => {
                  e.currentTarget
                      .querySelector(':scope > ul')
                      .classList.remove('hidden');
              }}
              onMouseOut={(e) => {
                  e.currentTarget
                      .querySelector(':scope > ul')
                      .classList.add('hidden');
              }}
            >
              <FaHatWizard />
              Hacks
                            <ul
                                className={`hidden absolute top-[20px] left-0 right-0 pt-4 pl-2`}
                            >
                                <li
                                    className={`cursor-pointer text-white bg-orange-500 hover:bg-white
                                                hover:text-orange-500 py-1 px-3`}
                                    onClick={initDB}
                                >
                                    reinitDB
                                </li>
                                <ul
                                    onMouseOver={(e) => {
                                        e.currentTarget
                                            .querySelector(':scope > ul')
                                            .classList.remove('hidden');
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget
                                            .querySelector(':scope > ul')
                                            .classList.add('hidden');
                                    }}
                                    className={`relative cursor-pointer text-white bg-orange-500 hover:bg-white
                                                hover:text-orange-500 py-1 px-3`}
                                >
                                    login as
                                    <ul
                                        className={`hidden absolute top-[32px] left-3 text-white`}
                                    >
                                        <li
                                            className={`cursor-pointer bg-orange-500
                                                        hover:bg-white hover:text-orange-500 p-1 px-3`}
                                            onClick={() => {
                                                loginAs({
                                                    usr: 'organization',
                                                    passwd: 'organization',
                                                });
                                            }}
                                        >
                                            organization
                                        </li>
                                        <li
                                            className={`cursor-pointer bg-orange-500
                                            hover:bg-white hover:text-orange-500 p-1 px-3`}
                                            onClick={() => {
                                                loginAs({
                                                    usr: 'venego',
                                                    passwd: 'venego',
                                                });
                                            }}
                                        >
                                            venego
                                        </li>
                                        <li
                                            className={`cursor-pointer bg-orange-500
                                            hover:bg-white hover:text-orange-500 p-1 px-3`}
                                            onClick={() => {
                                                loginAs({
                                                    usr: 'segfaulty',
                                                    passwd: 'segfaulty',
                                                });
                                            }}
                                        >
                                            segfaulty
                                        </li>
                                        <li
                                            className={`cursor-pointer bg-orange-500
                                            hover:bg-white hover:text-orange-500 p-1 px-3`}
                                            onClick={() => {
                                                loginAs({
                                                    usr: 'potato',
                                                    passwd: 'potato',
                                                });
                                            }}
                                        >
                                            potato
                                        </li>
                                    </ul>
                                </ul>
                            </ul>
                        </ul>

        </ul>
      </nav>
      {/*
       */}
      <Outlet
        context={{
          menuExpanded: menuRefs.expanded,
          isLoggedIn: isLoggedInState,
          loggedInUser: loggedInUserState,
        }}
      />
    </>
  ) : (
    <>fetching data</>
  );
}
