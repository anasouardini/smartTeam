import React from 'react';

export default function Login() {
  const classes = {
    formItem: 'w-full my-3 py-2',
    input:`capitalize border-b-orange-500 border-b-2
           focus:border-b-white outline-none
           bg-transparent placeholder:text-gray-200
          `,
    button: 'bg-orange rounded-md bg-orange-500 font-bold',
  };

  return (
    <>
      <main
        aria-label='login'
        className={`bg-[url("/bg1.png")] bg-no-repeat bg-center relative
                  before:absolute before:top-0 before:right-0
                  before:bottom-0 before:left-0
                  before:opacity-80

                  before:bg-gradient-to-r before:from-slate-900
                  before:via-purple-900 before:to-slate-900

                  text-white h-[100vh]
                  flex items-center justify-center`}
      >
        <div
          aria-label='login card'
          className='flex flex-col items-center justify-center backdrop-blur-lg px-20 py-20'
        >
          <div aria-label='grouping card'>
            <div aria-label='logo'></div>
            <h1 className='first-letter:uppercase font-bold text-xl mb-6'>
              log in to your account
            </h1>
            <form className='max-w-xs'>
              <input
                className={`${classes.formItem} ${classes.input}`}
                type='text'
                name='username'
                placeholder='Username'
              />
              <input
                className={`${classes.formItem} ${classes.input}`}
                type='password'
                name='password'
                placeholder='password'
              />
              <input
                className={`${classes.formItem} ${classes.button}`}
                type='submit'
                name='submit'
                value='Login'
              />
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
