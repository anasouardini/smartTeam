import { useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';

import Bridge from '../tools/bridge';

export default function Profile(){


  const profileInputsRef = useRef({fullname: '', title: ''}).current;

  const userInfoQuery = useQuery('userInfoQuery', async () => {
    const response = await Bridge('get', `user/${usernameParam}`);
    return response?.err == 'serverError' ? false : response.data;
  });

  if (userInfoQuery.status == 'success') {
    console.log('RQ.data: ', userInfoQuery.data);
  }


  return userInfoQuery.status == 'success' && !userInfoQuery.data?.error ? (
    <main className='text-black mt-[3rem]'>
      <section aria-label='name-title-pic'>
        <img aria-label='profile picture' src='' alt='' />
        <div>
          <h1 aria-label='fullname'>{userInfoQuery.data.fullname}</h1>
          <h2 aria-label='title'>{userInfoQuery.data.title}</h2>
        </div>
      </section>
      <section></section>
      <section></section>
    </main>
  ) : (
    <></>
  );
}
