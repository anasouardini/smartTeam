import React from 'react';
import Bridge from '../../tools/bridge';
import { useOutletContext, Navigate } from 'react-router-dom';
import Vars from '../../vars';

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
        username: e.target[0].value,
        password: e.target[1].value,
      });
    } else if (props.label == 'signup') {
      const genBody = props.fields.reduce(
        (acc: { [key: string]: string }, field, index) => {
          acc[field[0]] = e.target[index].value;
          return acc;
        },
        {}
      );
      response = await Bridge('post', 'signup', genBody);
    }

    if (!response?.err) return console.log(response);
  };

  return (
    <>
      <main
        aria-label={props.label}
        className={`bg-[url("/bg2.png")] bg-no-repeat bg-center bg-cover relative
                    before:absolute before:top-0 before:right-0
                    before:bottom-0 before:left-0
                    before:opacity-80

                    before:bg-gradient-to-r before:from-orange-900
                    before:via-red-900 before:to-orange-900

                    text-white h-[100vh]
                    flex items-center justify-center`}
      >
        <div
          aria-label={`${props.label} card`}
          className='flex flex-col items-center justify-center backdrop-blur-2xl rounded-xl px-12 py-12'
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
                    placeholder={field[0]}
                  />
                );
              })}
              <input
                onClick={handleAuth}
                className={`${tailwindClasses.formItem} ${tailwindClasses.button} mt-7`}
                type='submit'
                name='submit'
                value={props.label}
              />
              <input
                onClick={(e:any)=>handleOAuth('google', e)}
                className={`${tailwindClasses.formItem} bg-transparent border-2 border-primary rounded-md`}
                type='submit'
                name='submit'
                value='use google account'
              />

              <input
                onClick={(e:any)=>handleOAuth('github', e)}
                className={`${tailwindClasses.formItem} bg-transparent border-2 border-primary rounded-md`}
                type='submit'
                name='submit'
                value='use github account'
              />
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
