import React from 'react';
import { useQuery } from 'react-query';
import Bridge from '../tools/bridge';
import Genid from '../tools/genid';
import Project from '../components/project';
import Form from '../components/form';

export default function Projects() {

  
  const [state, setState] = React.useState({
    popup: { form: { show: false, mode: 'create' } },
  });
  const stateActions = {
    form: {
      show: () => {
        const stateCpy = { ...state }; // tricking react with a shallow copy
        stateCpy.popup.form.show = true;
        setState(stateCpy);
      },
      hide: () => {
        const stateCpy = { ...state}; // tricking react with a shallow copy
        stateCpy.popup.form.show = false;
        setState(stateCpy);
      },
    },
  };

  const formFieldsRef = React.useRef({
    title: {
      value: '',
      tagName: 'input',
      type: 'string',
    },
    description: {
      value: '',
      tagName: 'textarea',
      type: 'string',
    },
    bgImg: {
      value: '',
      tagName: 'input',
      type: 'string',
    },
    status: {
      value: '',
      tagName: 'select',
      type: 'list',
    },
  }).current;

  const projectsQuery = useQuery('projects', async () => {
    const response = await Bridge('read', `project/all`);
    return response?.err == 'serverError' ? false : response.data;
  });

  type projectsResponseT = {
    id: string,
    projectsNumber: number;
    doneProjectsNumber: number;
    title: string;
    description: string;
    bgImg: string;
    status: 'todo' | 'in progress' | 'done';
    progress: number
  };

  const createNewProject = async () => {
    stateActions.form.show();
  };

  const tailwindClx = {
    projectBorder: 'border-2 border-primary rounded-md',
    projectItem: `flex items-center justify-center w-[12rem]
                    h-[7rem] text-primary text-2xl`,
  };

  const listProjects = () => {
    return projectsQuery.data.map((projectItem:projectsResponseT) => {
      // randome key to keep the UI from staling
      return <Project key={`${Genid(20)}`} projectItem={projectItem} refetch={projectsQuery.refetch} />;
    });
  };

  return (
    <main
      aria-label='projects'
      className='text-black mt-[7rem] pl-20 flex gap-6'
    >
      <table>
        <th>
          <tr></tr>
        </th>
      </table>
      {projectsQuery.status == 'success' ? listProjects() : <></>}

      {/* new project button*/}
      <button
        onClick={createNewProject}
        className={`${tailwindClx.projectBorder} ${tailwindClx.projectItem}`}
      >
        +
      </button>

      {state.popup.form.show ? (
        <Form
          fields={formFieldsRef}
          mode={state.popup.form.mode}
          refetch={projectsQuery.refetch}
          hideForm={stateActions.form.hide}
        />
      ) : (
        <></>
      )}
    </main>
  );
}
