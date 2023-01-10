import React from 'react';

export default function Authentication(props: {
  title: string;
  label: string;
  fields: string[];
}) {
  const tailwindClasses = {
    formItem: 'w-full my-3 py-2',
    input: `capitalize border-b-primary border-b-2
           focus:border-b-white outline-none
           bg-transparent placeholder:text-gray-200
          `,
    button: 'bg-orange rounded-md bg-primary font-bold',
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
  };

  return (
    <>
      <main
        aria-label={props.label}
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
          aria-label={`${props.label} card`}
          className='flex flex-col items-center justify-center backdrop-blur-lg px-20 py-20'
        >
          <div aria-label='grouping card'>
            <div aria-label='logo'></div>
            <h1 className='first-letter:uppercase font-bold text-xl mb-6'>
              {props.title}
            </h1>
            <form className='max-w-xs'>
              {props.fields.map((field) => {
                return (
                  <input
                    key={field}
                    className={`${tailwindClasses.formItem} ${tailwindClasses.input}`}
                    type={field == 'username' ? 'text' : { field }}
                    name={field}
                    placeholder={field}
                  />
                );
              })}
              <input
                onClick={handleSubmit}
                className={`${tailwindClasses.formItem} ${tailwindClasses.button} mt-7`}
                type='submit'
                name='submit'
                value={props.label}
              />
              <input
                className={`${tailwindClasses.formItem} bg-transparent border-2 border-primary rounded-md`}
                type='submit'
                name='submit'
                value='use google account'
              />
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
