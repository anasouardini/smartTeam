import React from 'react';
import { useQuery } from 'react-query';
import Bridge from '../tools/bridge';
import Genid from '../tools/genid';
import Portfolio from '../components/portfolio';
import Form from '../components/form';
import FormFields from '../components/formFields';

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
        const stateCpy = { ...state }; // tricking react with a shallow copy
        stateCpy.popup.form.show = false;
        setState(stateCpy);
      },
    },
  };

  const formFieldsRef = React.useRef<{
    [key: string]: { tagName: string; props: { [key: string]: string } }
  }>(
   FormFields('portfolio')
  ).current;

  const portfoliosQuery = useQuery('portfolios', async () => {
    const response = await Bridge('read', `portfolio/all`);
    return response?.err == 'serverError' ? false : response.data;
  });

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

  const createNewPortfolio = async () => {
    stateActions.form.show();
  };

  const tailwindClx = {
    portfolioBorder: 'border-2 border-primary rounded-md',
    portfolioItem: `flex items-center justify-center w-[12rem]
                    h-[7rem] text-primary text-2xl`,
  };

  const listPortfolios = () => {
    return portfoliosQuery.data.map((portfolioItem: porfoliosResponseT) => {
      // randome key to keep the UI from staling
      return (
        <Portfolio
          key={`${Genid(20)}`}
          portfolioItem={portfolioItem}
          refetch={portfoliosQuery.refetch}
        />
      );
    });
  };

  // TODO: this should be in it's own component
  const listFields = () => {
    const fields =  FormFields('portfolio');
    return Object.keys(fields).map((fieldKey) => {
      let TagName = fields[fieldKey].tagName;
      if (TagName == 'textarea') {
        TagName = 'input';
      }
      return <TagName key={fieldKey} {...fields[fieldKey].props} />;
    });
  };


  return (
    <div aria-label='container' className={`grow flex flex-col`}>
      <header aria-label='filters' className={`px-6 py-4 flex flex-wrap gap-4`}>
        {listFields()}
        <button className={`ml-auto bg-primary text-white rounded-md px-2`}>
          Filter
        </button>
      </header>
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
            style='popup'
            route={'portfolio'}
            refetch={portfoliosQuery.refetch}
            hideForm={stateActions.form.hide}
          />
        ) : (
          <></>
        )}
      </main>
    </div>
  );
}
