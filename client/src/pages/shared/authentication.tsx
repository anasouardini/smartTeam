import React from 'react';
import Bridge from '../../tools/bridge';
import { useOutletContext, Navigate } from 'react-router-dom';
import Vars from '../../vars';

import {toast} from 'react-toastify';

export default function Authentication(props: {
  title: string;
  label: string;
  fields: string[][];
}) {
  const outletContext: { isLoggedIn: boolean } = useOutletContext();
  // console.log('outlet: ', outletContext)
  if (outletContext.isLoggedIn) {
    return <Navigate to='/'></Navigate>;
  }

  // setting background image in the body
  React.useEffect(()=>{
    if(!document.body.querySelector('style.bodyStyleForLoginPage')){
      const styleTag = document.createElement('style');
      styleTag.classList.add('bodyStyleForLoginPage');
      const styleText = document.createTextNode(`body{
        background: #fff url("/skyscapers.jpg") no-repeat center;
        background-size: cover;
        position: relative;
      }
      body::before{
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          z-index: -1;
          opacity: .8;
          /* background: linear-gradient(to right, #7c2d12, #7f1d1d, #7c2d12); */
          background: rgba(100, 100, 100, .7);
      }`);
      styleTag.appendChild(styleText);
      document.body.appendChild(styleTag);
    }
  }, []);

  const inputsRef = React.useRef<{[key:string]: HTMLInputElement}>({}).current;

  const tailwindClasses = {
    formItem: 'w-full my-3 py-2',
    input: `border-b-primary border-b-2
           focus:border-b-white outline-none
           bg-transparent placeholder:text-gray-200
          `,
    button: 'bg-orange rounded-md bg-primary font-bold',
  };

  const handleOAuth = async (method:string, e: any) => {
    e.preventDefault();
    window.location.assign(`${Vars.serverAddress}/oauth/${method}`);
  };

  const handleAuth = async (e: any) => {
    e.preventDefault();
    let response: {
      data?: {};
      status?: number;
      err?: string;
      route?: string;
    } | null = null;

    if (props.label == 'login') {
      response = await Bridge('post', 'login', {
        username: inputsRef['username'].value,
        password: inputsRef['password'].value,
      });
    } else if (props.label == 'signup') {
      // console.log(e.target[0])
      const genBody = props.fields.reduce(
        (acc: { [key: string]: string }, field, index) => {
          acc[field[0]] = inputsRef[field[0]].value;
          return acc;
        },
        {}
      );
      response = await Bridge('post', 'signup', genBody);
    }

    if (!response?.err){
      toast.error(response)
      return;
    }
  };

  return (
    <>
      <main
        aria-label={props.label}
        className={`
                    text-white
                    grow flex items-center justify-center`}
      >
        <div
          aria-label={`${props.label} card`}
          className='flex flex-col items-center justify-center backdrop-blur-sm
                      rounded-xl px-12 py-12'
        >
          <div aria-label='grouping card'>
            <div aria-label='logo'></div>
            <h1 className='first-letter:uppercase font-bold text-xl mb-6'>
              {props.title}
            </h1>
            <form
              className='max-w-xs'
              onSubmit={(e: any) => e.preventDefault()}
            >
              {props.fields.map((field) => {
                return (
                  <input
                    key={field[0]}
                    className={`${tailwindClasses.formItem} ${tailwindClasses.input}`}
                    type={field[1]}
                    name={field[0]}
                    ref={(el)=>{inputsRef[field[0]] = el}}
                    placeholder={field[0]}
                  />
                );
              })}
              <input
                onClick={handleAuth}
                className={`${tailwindClasses.formItem} ${tailwindClasses.button} mt-7 cursor-pointer`}
                type='submit'
                name='submit'
                value={props.label}
              />
              <button
                onClick={(e:any)=>handleOAuth('google', e)}
                className={`${tailwindClasses.formItem} bg-transparent border-2 border-primary rounded-md`}
              >
                use google account
              </button>
              <button
                onClick={(e:any)=>handleOAuth('github', e)}
                className={`${tailwindClasses.formItem} bg-transparent border-2 border-primary rounded-md`}
              >
                use github account
              </button>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
