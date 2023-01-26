import React from 'react';
import { useQuery } from 'react-query';
import Bridge from '../tools/bridge';
import Genid from '../tools/genid';
import Portfolio from '../components/portfolio';
import Form from '../components/form';

export default function Portfolios() {

  
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

  const portfoliosQuery = useQuery('portfolios', async () => {
    const response = await Bridge('read', `portfolio/all`);
    return response?.err == 'serverError' ? false : response.data;
  });

  type porfoliosResponseT = {
    id: string,
    projectsNumber: number;
    doneProjectsNumber: number;
    title: string;
    description: string;
    bgImg: string;
    status: 'todo' | 'in progress' | 'done';
    progress: number
  };

  const createNewPortfolio = async () => {
    stateActions.form.show();
  };

  const tailwindClx = {
    portfolioBorder: 'border-2 border-primary rounded-md',
    portfolioItem: `flex items-center justify-center w-[12rem]
                    h-[7rem] text-primary text-2xl`,
  };

  const listPortfolios = () => {
    return portfoliosQuery.data.map((portfolioItem:porfoliosResponseT) => {
      // randome key to keep the UI from staling
      return <Portfolio key={`${Genid(20)}`} portfolioItem={portfolioItem} refetch={portfoliosQuery.refetch} />;
    });
  };

  return (
    <main
      aria-label='portfolios'
      className='text-black mt-[7rem] pl-20 flex gap-6'
    >
      {portfoliosQuery.status == 'success' ? listPortfolios() : <></>}

      {/* new portfolio button*/}
      <button
        onClick={createNewPortfolio}
        className={`${tailwindClx.portfolioBorder} ${tailwindClx.portfolioItem}`}
      >
        +
      </button>

      {state.popup.form.show ? (
        <Form
          fields={formFieldsRef}
          mode={state.popup.form.mode}
          refetch={portfoliosQuery.refetch}
          hideForm={stateActions.form.hide}
        />
      ) : (
        <></>
      )}
    </main>
  );
}
