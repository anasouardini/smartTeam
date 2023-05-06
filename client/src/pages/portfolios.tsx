import React from 'react';
import { useQuery } from 'react-query';
import { useOutletContext } from 'react-router-dom';
import { FaPen, FaTrash } from 'react-icons/fa';
import Bridge from '../tools/bridge';
import Genid from '../tools/genid';
import Form from '../components/form';
import FormFields from '../components/formFields';

export default function Portfolios() {
  const { loggedInUser } = useOutletContext<{
    loggedInUser: { username: string; id: string };
    isLoggedIn: boolean;
  }>();

  const [state, setState] = React.useState({
    popup: { form: { show: false, mode: 'create', itemID: '' } },
  });
  const stateActions = {
    form: {
      show: (itemID: string | undefined, mode: 'edit' | 'create') => {
        const stateCpy = structuredClone(state); // tricking react with a shallow copy

        if (mode == 'edit') {
          if (itemID === undefined) {
            toast.error('you forgot to include the item id for editing')
            return;
          }
          stateCpy.popup.form.itemID = itemID;
        }

        stateCpy.popup.form.show = true;
        // console.log(state.popup.sideForm.show)

        stateCpy.popup.form.mode = mode;
        setState(stateCpy);
      },
      hide: () => {
        const stateCpy = { ...state }; // tricking react with a shallow copy
        stateCpy.popup.form.show = false;
        setState(stateCpy);
      },
    },
  };

  const Refs = React.useRef<{
    formFields: {
      [key: string]: { tagName: string; props: { [key: string]: string } };
    };
    selectInputs: { [key: string]: HTMLElement };
    formHiddenFields: { owner_FK: string };
  }>({
    formFields: FormFields('portfolio'),
    selectInputs: {},
    formHiddenFields: { owner_FK: '' },
  });

  const itemsListQuery = useQuery('connections list', async () => {
    const requestObj = {
      items: {
        profiles: {
          name: 'connections',
          filter: { userID: loggedInUser.id },
        },
      },
    };
    const response = await Bridge('post', 'itemsList', requestObj);
    return response?.err == 'serverError' ? false : response.data;
  });

  // if(itemsListQuery.status == 'success'){
  //   console.log(itemsListQuery.data)
  // }

  const portfoliosQuery = useQuery(
    'portfolios',
    async () => {
      const requestObj = {};
      const profile =
        Refs.current.selectInputs?.profiles?.value ||
        itemsListQuery.data?.profiles[0].id;
      if (profile) {
        requestObj.owner_FK = profile;
      }
      // console.log(Ref.current.selectInputs?.profiles?.value)
      // console.log(itemsListQuery.data?.profiles)

      const urlEncodedRequestObj = new URLSearchParams(requestObj);
      const response = await Bridge(
        'read',
        `portfolio/all?${urlEncodedRequestObj}`
      );
      return response?.err == 'serverError' ? false : response.data;
    },
    { enabled: !!itemsListQuery.data?.profiles }
  );
  if(portfoliosQuery.status == 'success'){
    // console.log(portfoliosQuery.data)
  }

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
    Refs.current.formHiddenFields.owner_FK =
      Refs.current.selectInputs.profiles.value;
    // TODO: set form values to selected filter values.
    stateActions.form.show(undefined, 'create');
  };

  const tailwindClx = {
    portfolioBorder: 'border-2 border-primary rounded-md',
    portfolioItem: `flex items-center justify-center w-[12rem]
                    h-[7rem] text-primary text-2xl`,
  };

  const editPortfolio = async (item) => {
    Refs.current.formHiddenFields.owner_FK =
      Refs.current.selectInputs.profiles.value;
    Refs.current.formFields = FormFields('portfolio', {
      title: { props: { defaultValue: item.title } },
      description: { props: { defaultValue: item.description } },
      bgImg: { props: { defaultValue: item.bgImg } },
      status: { props: { defaultValue: item.status } },
    });

    stateActions.form.show(item.id, 'edit');
  };

  const removePortfolio = async (item) => {
    const resp = await Bridge('remove', `portfolio`, {
      owner_FK: Refs.current.selectInputs.profiles.value,
      id: item.id,
    });

    if (resp.err) {
      return;
    }

    portfoliosQuery.refetch();
  };



  const listPortfolios = () => {
    return portfoliosQuery.data.map((portfolioItem: porfoliosResponseT) => {
      // randome key to keep the UI from staling
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
              onClick={() => removePortfolio(portfolioItem)}
              className={`absolute top-2 left-2 text-xl`}
            >
              <FaTrash />
            </button>
            <button
              onClick={() => editPortfolio(portfolioItem)}
              className={`absolute top-2 right-2 text-xl`}
            >
              <FaPen />
            </button>
            <span aria-label='number of projects'>
              {portfolioItem.doneProjectsNumber}/{portfolioItem.projectsNumber}
            </span>
          </div>
          <h4
            className='mt-3 text-xl block'
          >
            {portfolioItem.title}
          </h4>
          <p className='text-gray-800'>{portfolioItem.description}</p>
        </div>
      );
    });
  };

  const listProfiles = () => {
    if (itemsListQuery.status != 'success') {
      return (
        <select>
          <option>empty list</option>
        </select>
      );
    }

    const profiles = itemsListQuery.data.profiles;
    return (
      <>
        <select
          onChange={() => {
            portfoliosQuery.refetch();
          }}
          className={`ml-auto`}
          ref={(el) => {
            Refs.current.selectInputs.profiles = el;
          }}
        >
          <option value={loggedInUser.id}>{loggedInUser.username}</option>
          {profiles.map((profile: { id: string; username: string }) => {
            return <option value={profile.id}>{profile.username}</option>;
          })}
        </select>
      </>
    );
  };
  // TODO: this should be in it's own component
  const listFields = () => {
    const fields = FormFields('portfolio');
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
        {listProfiles()}
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
            fields={Refs.current.formFields}
            hiddenFields={Refs.current.formHiddenFields}
            mode={state.popup.form.mode}
            style='popup'
            route={'portfolio'}
            refetch={portfoliosQuery.refetch}
            itemID={state.popup.form.itemID}
            hideForm={stateActions.form.hide}
          />
        ) : (
          <></>
        )}
      </main>
    </div>
  );
}
