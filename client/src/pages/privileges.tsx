import React from 'react';
import { useQuery } from 'react-query';
import Bridge from '../tools/bridge';
import Genid from '../tools/genid';
import toUrlEncoded from '../tools/toUrlEncoded';
import Form from '../components/form';

export default function Privileges() {
  // const [state, setState] = React.useState();
  // const stateActions = {};

  const [state, setState] = React.useState({
    popup: {
      sideForm: { random: '', show: false, mode: 'create', itemID: '' },
    },
  });
  const stateActions = {
    sideForm: {
      show: (itemID: string | undefined, mode: 'edit' | 'create') => {
        const stateCpy = { ...state }; // tricking react with a shallow copy

        if (mode == 'edit') {
          if (itemID === undefined) {
            return console.log(
              'err: forgot to include the item id for editing'
            );
          }
          stateCpy.popup.sideForm.itemID = itemID;
        }

        stateCpy.popup.sideForm.show = true;
        stateCpy.popup.sideForm.random = Genid(10);
        // console.log(state.popup.sideForm.show)

        stateCpy.popup.sideForm.mode = mode;
        setState(stateCpy);
      },
      hide: () => {
        const stateCpy = { ...state }; // tricking react with a shallow copy
        stateCpy.popup.sideForm.show = false;
        setState(stateCpy);
      },
    },
  };

  const tailwindClx = {
    commonBorder: `border-2 border-primary rounded-md px-1 py-1`
  }

  const privilegesQuery = useQuery('privileges', async () => {
    const queryFilter = Object.keys(selectRefs).reduce<{
      [key: string]: string | undefined;
    }>((acc, refKey) => {
      acc[refKey] = selectRefs[refKey]?.value;
      return acc;
    }, {});
    let response = await Bridge(
      'read',
      `privileges/all${toUrlEncoded(queryFilter)}`
    );
    return !response || response?.err == 'serverError' ? false : response.data;
  });

  const itemsListQuery = useQuery(
    'users&portfolios&projects&tasks&privilegesCategories list',
    async () => {

      const requestObj = { portfolios: '', projects:'', tasks:'', users:'', privilegesCategories:'' };
      const urlEncodedRequestObj = new URLSearchParams(requestObj);
      const response = await Bridge(
        'read',
        `itemsList?${urlEncodedRequestObj}`
      );
      return response?.err == 'serverError' ? false : response.data;
    }
  );

  const selectRefs = React.useRef<{ [key: string]: HTMLSelectElement | null }>(
    {}
  ).current;

  if (itemsListQuery.status != 'success') {
    return <p>I DON'T HAVE A LOADING SPINNER</p>;
  }

  const listRules = () => {
    if (privilegesQuery.status == 'success') {
      console.log(privilegesQuery.data);
    }
    return <></>;
  };

  const listHeaderFields = () => {
    const list = itemsListQuery.data;
    // console.log(list);
    return (
      <>
        {Object.keys(list).map((itemKey) => {
          return (
            <select
              onChange={() => {
                privilegesQuery.refetch();
              }}
              className={tailwindClx.commonBorder}
              key={itemKey}
              name={itemKey}
              ref={(el) => {
                selectRefs[itemKey] = el;
              }}
            >
              <option key={'emptyoption'} value=''>
                {itemKey}
              </option>

              {list[itemKey].map((item: { [key: string]: string }) => {
                return (
                  <option key={item.id} value={item.id}>
                    {item.id}
                  </option>
                );
              })}
            </select>
          );
        })}
      </>
    );
  };

  return (
    <div aria-label='container' className={`grow flex flex-col`}>
      <header aria-label='filters' className={`px-6 py-4 flex flex-wrap gap-4`}>
        {listHeaderFields()}
        <button onClick={stateActions.sideForm.show} className={`ml-auto bg-primary text-white rounded-md px-2`}>
          New
        </button>
      </header>
      <main
        aria-label='portfolios'
        className='text-black mt-[7rem] pl-20 flex gap-6'
      >
        {privilegesQuery.status == 'success' ? listRules() : <></>}
        {state.popup.sideForm.show && tasksQuery.status == 'success' ? (
          <Form
            fields={formFieldsRef.current}
            mode={state.popup.sideForm.mode}
            route='task'
            refetch={tasksQuery.refetch}
            itemID={state.popup.sideForm.itemID}
            hideForm={stateActions.sideForm.hide}
          />
        ) : (
          <></>
        )}
      </main>
    </div>
  );
}
