import React from 'react';
import { useQuery } from 'react-query';
import Bridge from '../tools/bridge';
import Genid from '../tools/genid';

export default function Privileges() {
  // const [state, setState] = React.useState();
  // const stateActions = {};

  const itemsListQuery = useQuery(
    'users&portfolios&projects&tasks list',
    async () => {
      const response = await Bridge(
        'read',
        `itemsList?item1=users&item2=portfolios&item3=projects&item4=tasks&item5=privileges`
      );
      return response?.err == 'serverError' ? false : response.data;
    }
  );

  if(itemsListQuery.status != 'success'){
    return <p>I DON'T HAVE A LOADING SPINNER</p>
  }

  const listRules = () => {};

  const listHeaderFields = () => {
    const list = itemsListQuery.data;
    console.log(list)
    return (
      <>
        <select name='username'>
          {list.users.map((user: { username: string; id: string }) => (
            <option key={user.id} value={user.id}>{user.username}</option>
          ))}
        </select>
        <select name='portfolio'>
          {list.portfolios.map((portfolio: { title: string; id: string }) => (
            <option key={portfolio.id} value={portfolio.id}>{portfolio.title}</option>
          ))}
        </select>
        <select name='project'>
          {list.projects.map((project: { title: string; id: string }) => (
            <option key={project.id} value={project.id}>{project.title}</option>
          ))}
        </select>
        <select name='task'>
          {list.tasks.map((task: { title: string; id: string }) => (
            <option key={task.id} value={task.id}>{task.title}</option>
          ))}
        </select>
        <select name='privileges category'>
          {list.privileges.map((rule: { title: string;}) => (
            <option key={rule.title} value={rule.title}>{rule.title}</option>
          ))}
        </select>
      </>
    );
  };

  return (
    <div aria-label='container' className={`grow flex flex-col`}>
      <header aria-label='filters' className={`px-6 py-4 flex flex-wrap gap-4`}>
        {listHeaderFields()}
        <button className={`ml-auto bg-primary text-white rounded-md px-2`}>
          New
        </button>
      </header>
      <main
        aria-label='portfolios'
        className='text-black mt-[7rem] pl-20 flex gap-6'
      >
        {itemsListQuery.status == 'success' ? listRules() : <></>}
      </main>
    </div>
  );
}
