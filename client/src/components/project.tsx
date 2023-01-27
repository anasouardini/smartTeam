import React from 'react';
import Bridge from '../tools/bridge';
import { FaPen, FaTrash } from 'react-icons/fa';
import Form from './form';

type projectsResponseT = {
  id: string;
  projectsNumber: number;
  doneProjectsNumber: number;
  title: string;
  description: string;
  bgImg: string;
  status: 'todo' | 'in progress' | 'done';
  progress: number;
};

export default function Project(props: {
  projectItem: projectsResponseT;
  refetch: () => void;
}) {

  const [state, setState] = React.useState({
    // just in case decided I need to change some parent-passed data
    item: props.projectItem,
    popup: { form: { show: false, mode: 'edit' } },
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
      value: state.item.title,
      tagName: 'input',
      type: 'string',
    },
    description: {
      value: state.item.description,
      tagName: 'textarea',
      type: 'string',
    },
    bgImg: {
      value: state.item.bgImg,
      tagName: 'input',
      type: 'string',
    },
    status: {
      value: state.item.status,
      tagName: 'select',
      type: 'list',
    },
  }).current;


  const editProject = async () => {
    stateActions.form.show();
  };

  const removeProject = async () => {
    const resp = await Bridge('remove', `project`, {
      id: state.item.id,
    });

    if (resp.err) {
      console.log(resp);
      return;
    }

    props.refetch();
  };

  return (
    <div aria-label='project container' className={`max-w-min`}>
      <div
        aria-label='project'
        className={`border-2 border-primary rounded-md
                        flex items-center justify-center w-[12rem]
                        h-[7rem] text-primary text-2xl
                        relative
                      `}
      >
        <button
          onClick={removeProject}
          className={`absolute top-2 left-2 text-xl`}
        >
          <FaTrash />
        </button>
        <button
          onClick={editProject}
          className={`absolute top-2 right-2 text-xl`}
        >
          <FaPen />
        </button>
        <span aria-label='number of projects'>
          {state.item.doneProjectsNumber}/{state.item.projectsNumber}
        </span>
      </div>
      <h2 className='mt-3 text-xl'>{state.item.title}</h2>
      <p className='text-gray-800'>{state.item.description}</p>

      {state.popup.form.show ? (
        <Form
          fields={formFieldsRef}
          mode={state.popup.form.mode}
          refetch={props.refetch}
          itemID={state.item.id}
          hideForm={stateActions.form.hide}
        />
      ) : (
        <></>
      )}
    </div>
  );
}
