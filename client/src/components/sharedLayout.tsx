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
  FaKey,
  FaHatWizard,
  FaBars,
} from 'react-icons/fa';
import { VscChromeClose } from 'react-icons/vsc';

type loggedInUserT = {
  username: string;
  id: string;
};

// TODO: add tooltips for the icons

export default function sharedLayout() {
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

  const menuRefs = React.useRef<{
    expanded: boolean;
    nav: HTMLElement | null;
    logo: HTMLElement | null;
    xIcon: HTMLElement | null;
    barsIcon: HTMLElement | null;
  }>({
    expanded: true,
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
    const res = await Bridge('post', 'initDB');
    console.log(res);
  };

  const logout = async () => {
    const res = await Bridge('post', 'logout');
    console.log(res);
  };

  // minimizing not hiding
  const toggleMenu = () => {
    if (
      !(menuRefs.nav && menuRefs.logo && menuRefs.xIcon && menuRefs.barsIcon)
    ) {
      return;
    }

    if (menuRefs.expanded) {
      menuRefs.nav.style.width = '2.2rem';
      menuRefs.nav.style.minWidth = '2.2rem'; //TODO: temp solution
      menuRefs.nav.style.borderRadius = '10px';
      menuRefs.logo.style.display = 'none';
      menuRefs.xIcon.style.display = 'none';
      menuRefs.barsIcon.style.display = 'inline';
      menuRefs.expanded = false;
      return;
    }

    menuRefs.expanded = true;
    menuRefs.nav.style.width = '10rem';
    menuRefs.nav.style.minWidth = '10rem'; //TODO: temp solution
    menuRefs.nav.style.borderRadius = '0';
    menuRefs.logo.style.display = 'inline';
    menuRefs.xIcon.style.display = 'inline';
    menuRefs.barsIcon.style.display = 'none';
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
    linkActive: `bg-white text-primary rounded-md
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
            <NavLink to={`/templates`} className={activeLink}>
              <FaKey />
              templates
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
        className='bg-primary text-white min-w-[10rem] overflow-hidden'
      >
        <div className='text-2xl py-4 flex justify-between'>
          <span ref={(el) => (menuRefs.logo = el)} className='pl-3'>
            LOGO
          </span>
          <button
            aria-label='menu minmize button'
            className={`cursor-pointer mr-2 pl-[5px]`}
            onClick={toggleMenu}
          >
            <span ref={(el) => (menuRefs.barsIcon = el)} className='hidden'>
              <FaBars />
            </span>
            <span ref={(el) => (menuRefs.xIcon = el)}>
              <VscChromeClose />
            </span>
          </button>
        </div>
        <ul className='backdrop-blur-xl h-[3rem] flex flex-col gap-3 min-w-min'>
          {listNavItems()}

          <li>
            <button
              onClick={initDB}
              className={`${tailwindClasses.navItem} ${tailwindClasses.link} w-full`}
            >
              <FaHatWizard />
              initDB
            </button>
          </li>
        </ul>
      </nav>
      {/*
       */}
      <Outlet
        context={{
          isLoggedIn: isLoggedInState,
          loggedInUser: loggedInUserState,
        }}
      />
    </>
  ) : (
    <>fetching data</>
  );
}
