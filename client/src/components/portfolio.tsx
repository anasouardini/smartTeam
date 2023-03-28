import React from 'react';
import Bridge from '../tools/bridge';
import { FaPen, FaTrash } from 'react-icons/fa';
import Form from './form';
import FormFields from '../components/formFields';

type porfoliosResponseT = {
  id: string;
  projectsNumber: number;
  doneProjectsNumber: number;
  title: string;
  description: string;
  bgImg: string;
  status: 'todo' | 'in progress' | 'done';
  progress: number;
};

export default function Portfolio(props: {
  portfolioItem: porfoliosResponseT;
  refetch: () => void;
}) {

  const [state, setState] = React.useState({
    // just in case decided I need to change some parent-passed data
    item: props.portfolioItem,
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

  const formFieldsRef = React.useRef(
    FormFields('portfolio', {
      title: 'default',
      description: 'default',
      bgImg: 'default',
      status: 'default',
    })
  );


  const editPortfolio = async () => {
    formFieldsRef.current = FormFields('portfolio', {
      title: {props:{defaultValue: state.item.title}},
      description: {props:{defaultValue: state.item.description}},
      bgImg: {props:{defaultValue: state.item.bgImg}},
      status: {props:{defaultValue: state.item.status}},
    })

    stateActions.form.show();
  };

  const removePortfolio = async () => {
    const resp = await Bridge('remove', `portfolio`, {
      id: state.item.id,
    });

    if (resp.err) {
      console.log(resp);
      return;
    }

    props.refetch();
  };

  return (
    <div aria-label='portfolio container' className={`max-w-min`}>
      <div
        aria-label='portfolio'
        className={`border-2 border-primary rounded-md
                        flex items-center justify-center w-[12rem]
                        h-[7rem] text-primary text-2xl
                        relative
                      `}
      >
        <button
          onClick={removePortfolio}
          className={`absolute top-2 left-2 text-xl`}
        >
          <FaTrash />
        </button>
        <button
          onClick={editPortfolio}
          className={`absolute top-2 right-2 text-xl`}
        >
          <FaPen />
        </button>
        <span aria-label='number of projects'>
          {state.item.doneProjectsNumber}/{state.item.projectsNumber}
        </span>
      </div>
      <a href={`/portfolios/${state.item.id}`} className='mt-3 text-xl block'>{state.item.title}</a>
      <p className='text-gray-800'>{state.item.description}</p>

      {state.popup.form.show ? (
        <Form
          fields={formFieldsRef.current}
          route={'portfolio'}
          style='popup'
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
