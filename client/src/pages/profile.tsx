import { useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';

import Bridge from '../tools/bridge';

export default function Profile() {
  const { user: usernameParam } = useParams();

  const profileInputsRef = useRef({ fullname: '', title: '' }).current;

  const userInfoQuery = useQuery('userInfoQuery', async () => {
    const response = await Bridge('get', `user/${usernameParam}`);
    return response?.err == 'serverError' ? false : response.data;
  });

  if (userInfoQuery.status == 'success') {
    console.log('RQ.data: ', userInfoQuery.data);
  }

  const TClasses = {
    inputLabel: `w-[20rem] flex justify-between items-center capitalize`,
    input: `border-transparent focus:border-primary outline-none border-2 rounded-md
            focus:text-black text-gray-600 px-2 py-1 placeholder:text-gray-600`,
    textArea: `border-transparent focus:border-primary outline-none border-2 rounded-xl
               focus:text-black text-gray-600 w-full px-2 py-1 placeholder:text-gray-600`,
  };

  return userInfoQuery?.status == 'success' && !userInfoQuery.data?.error ? (
    <main className='text-black mt-[7rem] mx-auto w-[80%] max-w-[600px]'>
      <section aria-label='name-title-pic' className={`flex`}>
        <img
          className={`rounded-[50%]`}
          aria-label='profile picture'
          src={userInfoQuery.data.avatar}
          alt=''
        />
        <div className={`flex flex-col justify-around ml-5 max-w-[18rem]`}>
          <input
            type='text'
            value={userInfoQuery.data.fullname}
            className={`${TClasses.input} text-2xl font-semibold`}
          />
          <input
            aria-label='professional title'
            type='text'
            {...{
              value: userInfoQuery.data.title,
              placeholder: 'what do you call yourself?',
            }}
            className={`${TClasses.input}`}
          />
        </div>
      </section>
      <section aria-label='description' className={`mt-10`}>
        <textarea
            {...{
              value: userInfoQuery.data.description,
              placeholder: 'Add a little bit of description about yourserlf and the pupose of this account.',
            }}
          rows={3} className={`${TClasses.textArea}`}>
          {userInfoQuery.data.description}
        </textarea>
      </section>
      <section aria-label='other inputs' className={`mt-7 flex flex-col gap-4`}>
        <label className={`${TClasses.inputLabel}`}>
          username:
          <input
            aria-label='username'
            type='text'
            value={userInfoQuery.data.username}
            className={`${TClasses.input}`}
          />
        </label>
        <label className={`${TClasses.inputLabel}`}>
          email:
          <input
            type='email'
            {...{
              value: userInfoQuery.data.email,
              placeholder: 'linus trovalds',
            }}
            className={`${TClasses.input}`}
          />
        </label>
      </section>
    </main>
  ) : (
    <></>
  );
}
