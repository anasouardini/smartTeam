import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';

import Bridge from '../tools/bridge';

import {toast} from 'react-toastify';

export default function Profile() {
  const { user: usernameParam } = useParams();

  // const profileFieldsRef = useRef<{[key: string]:string}>({}).current;

  const userInfoQuery = useQuery('userInfoQuery', async () => {
    const response = await Bridge('read', `user/${usernameParam}`);
    return response?.err == 'serverError' ? false : response.data;
  });

  // if (userInfoQuery.status == 'success') {
  //   console.log('RQ.data: ', userInfoQuery.data);
  // }

  const getCnxLink = async ()=>{
    const resp = await Bridge('read', 'connectionLink');
    navigator.clipboard.writeText(resp.data);
    toast.info("Invitation link has been copied to clipboard")
  }

  const updateField = async (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    const name = e.target.name;

    // if the value hasn't changed just abort
    if (userInfoQuery.data?.[name] == value) {
      return;
    }

    const userUpdateResp = await Bridge(
      'update',
      `user/${userInfoQuery.data.username}`,
      { [name]: value }
    );
    toast.info(userUpdateResp.data)
  };

  const TClasses = {
    inputLabel: `w-[20rem] flex justify-between items-center capitalize`,
    border: `border-gray-300 focus:border-primary outline-none border-2 rounded-md`,
    input: `focus:text-black text-gray-600 px-2 py-1 placeholder:text-gray-600`,
    textArea: `focus:text-black text-gray-600 w-full px-2 py-1 placeholder:text-gray-600`,
  };

  return userInfoQuery?.status == 'success' && !userInfoQuery.data?.error ? (
    <main className='text-black mt-[7rem] mx-auto w-[80%] max-w-[600px]'>
      <section aria-label='name-title-pic' className={`flex`}>
        <img
          className={`rounded-[50%] w-40`}
          aria-label='profile picture'
          src={userInfoQuery.data.avatar}
          alt=''
        />
        <div
          className={`flex flex-col justify-center gap-3 ml-5 max-w-[18rem]`}
        >
          <input
            onBlur={updateField}
            name='fullname'
            aria-label='full name'
            type='text'
            defaultValue={userInfoQuery.data.fullname}
            className={`${TClasses.input} ${TClasses.border} text-2xl font-semibold`}
          />
          <input
            onBlur={updateField}
            name='title'
            aria-label='professional title'
            type='text'
            {...{
              defaultValue: userInfoQuery.data.title,
              placeholder: 'what do you call yourself?',
            }}
            className={`${TClasses.input} ${TClasses.border}`}
          />
        </div>
      </section>
      <section aria-label='description' className={`mt-10`}>
        <textarea
          onBlur={updateField}
          name='description'
          {...{
            defaultValue: userInfoQuery.data.description,
            placeholder:
              'Add a little bit of description about yourserlf and the pupose of this account.',
          }}
          rows={3}
          className={`${TClasses.textArea} ${TClasses.border}`}
        ></textarea>
      </section>
      <section aria-label='other inputs' className={`mt-7 flex flex-col gap-4`}>
        <label className={`${TClasses.inputLabel}`}>
          username:
          <input
            onBlur={updateField}
            name='username'
            aria-label='username'
            type='text'
            defaultValue={userInfoQuery.data.username}
            className={`${TClasses.input} ${TClasses.border}`}
          />
        </label>
        <label className={`${TClasses.inputLabel}`}>
          email:
          <input
            onBlur={updateField}
            name='email'
            type='email'
            {...{
              defaultValue: userInfoQuery.data.email,
              placeholder: 'linus trovalds',
            }}
            className={`${TClasses.input} ${TClasses.border}`}
          />
        </label>
      </section>
      <button className={`mt-5 bg-primary text-white rounded-md px-2 py-1`} onClick={getCnxLink}>
        Get Connection Link
      </button>
    </main>
  ) : (
    <></>
  );
}
