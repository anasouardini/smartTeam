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
  const rLocation = useLocation();

  if(rLocation.pathname == '/'){
    routerNavigate('/login')
  }

  const [isLoggedInState, setIsLoginState] = React.useState<
    undefined | boolean
  >(undefined);
  const [loggedInUserState, setLoggedInUserState] = React.useState<
    loggedInUserT | {}
  >({});

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
  });

  // TODO: menu doesn't work in projects(overflowed width) page
  // redirecting
  const authenticating: boolean =
    rLocation.pathname == '/login' || rLocation.pathname == '/signup';
  if (isLoggedInState != undefined) {
    if (isLoggedInState && authenticating) {
      // return <Navigate to={`/user/${loggedInUserState?.username}`}></Navigate>;
      routerNavigate(`/user/${loggedInUserState?.username}`);
    }

    if (!isLoggedInState && !authenticating) {
      // return <Navigate to='/login'></Navigate>;
      routerNavigate('/login');
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
  
  const expandNav = ()=>{
    if(document.querySelector('#table-container')){
      document.querySelector('#table-container').style.width = 'calc(100vw - 10rem - 40px)'
    }

    // expand nav elements
    Array.from(menuRefs.current.nav.querySelectorAll(':scope > ul > *')).forEach((navItem)=>{
      navItem.style.display = 'inline-block';
      navItem.style.width = 'unset';
      if(navItem.tagName !== 'UL'){
        navItem.style.overflow = 'visible';
      }
    });

    // menuRefs.current.nav.querySelector('ul > ul').style.overflow = 'auto';
    // menuRefs.current.nav.querySelector('ul > div.shallowItems').style.overflow = 'auto';

    menuRefs.current.nav.style.marginLeft = '0';
    menuRefs.current.nav.style.paddingTop = '0';
    menuRefs.current.nav.style.paddingBottom = '0';
    menuRefs.current.nav.style.height = '100vh';
    menuRefs.current.nav.style.display = 'inline-block';

    menuRefs.current.nav.style.width = '10rem';
    menuRefs.current.nav.style.minWidth = '10rem';
    menuRefs.current.nav.style.borderRadius = '0';
    menuRefs.current.logo.style.display = 'inline';
    menuRefs.current.xIcon.style.display = 'inline';
    menuRefs.current.barsIcon.style.display = 'none';

    menuRefs.current.expanded = true;
  }
  const shrinkNav = ()=>{
    if(document.querySelector('#table-container')){
      document.querySelector('#table-container').style.width = 'calc(100vw - 2.2rem - 0.5rem - 40px)';
    }

    // shrink nav elements
    Array.from(menuRefs.current.nav.querySelectorAll(':scope > ul > *')).forEach((navItem)=>{
      navItem.style.cssText = 'display: flex; width: 2.2rem; overflow: hidden;'
    });

    if(!menuRefs.current.nav?.querySelector('style')){
      const styleTag = document.createElement('style');
      styleTag.innerText = `nav > ul > *:hover{width: auto !important; overflow: visible !important}`;
      menuRefs.current.nav.appendChild(styleTag);
    }

    // menuRefs.current.nav.querySelector('ul > ul').style.overflow = 'hidden';
    // menuRefs.current.nav.querySelector('ul > div.shallowItems').style.overflow = 'hidden';

    menuRefs.current.nav.style.marginLeft = '.5rem';
    menuRefs.current.nav.style.marginTop = 'auto';
    menuRefs.current.nav.style.marginBottom = 'auto';
    menuRefs.current.nav.style.paddingTop = '2rem';
    menuRefs.current.nav.style.paddingBottom = '2rem';
    menuRefs.current.nav.style.width = '2.2rem';
    menuRefs.current.nav.style.height = 'unset';
    menuRefs.current.nav.style.display = 'flex';
    menuRefs.current.nav.style.flexDirection = 'column';
    menuRefs.current.nav.style.justifyItems = 'center';
    menuRefs.current.nav.style.minWidth = '2.2rem'; //TODO: temp solution
    menuRefs.current.nav.style.borderRadius = '10px';
    menuRefs.current.logo.style.display = 'none';
    menuRefs.current.xIcon.style.display = 'none';
    menuRefs.current.barsIcon.style.display = 'inline';

    menuRefs.current.expanded = false;
  }

  React.useEffect(()=>{
    if(menuRefs.current.nav){
      if(!menuRefs.current.expanded){
        shrinkNav();
      }else{
        expandNav();
      }
    }
  })

  // minimizing not hiding
  const toggleMenu = () => {
    if (
      !(menuRefs.current.nav && menuRefs.current.logo && menuRefs.current.xIcon && menuRefs.current.barsIcon)
    ) {
      return;
    }

    if (menuRefs.current.expanded) {
      shrinkNav();
      return;
    }

    expandNav();

  };

  const tailwindClasses = {
    link: 'text-white hover:bg-white hover:text-primary',
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
              className={`${tailwindClasses.navItem} ${tailwindClasses.link} hover:w-full`}
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
            <FaSignInAlt/>
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
      <div className={`grow flex w-full`}>
        {/*aria-expanded would not makes sense here*/}
        <nav
          ref={(el) => (menuRefs.current.nav = el)}
          className={`bg-primary text-white z-10
                    ml-[.5rem] pt-4 pb-4 my-auto rounded-[10px] w-[2.1rem] min-w-[2.1rem]
                    flex flex-col justify-center`}
        >
          <div className='text-2xl py-4 flex justify-between'>
            <span ref={(el) => (menuRefs.current.logo = el)} className='pl-3 hidden'>
              LOGO
            </span>
            <button
              aria-label='menu minmize button'
              className={`cursor-pointer mr-2 pl-[5px]`}
              onClick={toggleMenu}
            >
              <span ref={(el) => (menuRefs.current.barsIcon = el)} className='inline'>
                <FaBars />
              </span>
              <span className={`hidden`} ref={(el) => (menuRefs.current.xIcon = el)}>
                <VscChromeClose />
              </span>
            </button>
          </div>
          <ul className='flex flex-col gap-3 min-w-min'>
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
                <div className='flex gap-3'>
                  <FaHatWizard />
                Hacks
                </div>
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
                                                  hover:text-orange-500 py-1 px-2`}
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
            menuExpanded: menuRefs.current.expanded,
            isLoggedIn: isLoggedInState,
            loggedInUser: loggedInUserState,
          }}
        />
      </div>
      <footer className={`grow-0 w-full flex flex-wrap gap-3 justify-center items-center py-1 bg-orange-500 text-white font-bold`}>
        Made by
          <span className='text-black'>
            <a href={`https://anasouardini.online`}>Anas Ouardini</a>
          </span>
        | <a target='_blank' href='https://github.com/anasouardini/smartTeam'>Github</a>
        | <a target='_blank' href='https://twitter.com/segfaulty1'>Twitter</a>
        | <a target='_blank' href='https://yesfordev.com'>Blog</a>
      </footer>
    </>
  ) : (
    <>fetching data</>
  );
}
