import React from 'react';
import { useQuery } from 'react-query';
import Bridge from '../tools/bridge';
import Genid from '../tools/genid';
import toUrlEncoded from '../tools/toUrlEncoded';
import Form from '../components/form';
import FormFields from '../components/formFields';

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
    commonBorder: `border-2 border-primary rounded-md px-1 py-1`,
  };

  const privilegesQuery = useQuery('privileges', async () => {
    const queryFilter = Object.keys(selectRefs).reduce<{
      [key: string]: string | undefined;
    }>((acc, refKey) => {
      if (refKey === 'targetEntity') {
        const selectedValue = selectRefs[refKey]?.value;
        if (selectedValue) {
          const listID = selectRefs[refKey]?.getAttribute('list');
          acc[refKey] = {
            type: selectedValue.split(' - ')[0].slice(0, -1) + '_FK',
            value:
              document.querySelector(
                `#${listID} option[value='${selectedValue}']`
              )?.dataset?.value || '%',
          };
        }
        return acc;
      }
      acc[refKey] = selectRefs[refKey]?.value ? selectRefs[refKey]?.value : '%';
      return acc;
    }, {});
    // console.log(queryFilter);
    let response = await Bridge('post', `privileges/all`, queryFilter);
    return !response || response?.err == 'serverError' ? false : response.data;
  });

  // if(privilegesQuery.status == 'success'){
  //     console.log(privilegesQuery.data)
  //   }

  const itemsListQuery = useQuery(
    'users&portfolios&projects&tasks&privilegesCategories list',
    async () => {
      const requestObj = {
        portfolios: '',
        projects: '',
        tasks: '',
        users: '',
        privilegesCategories: '',
      };
      const urlEncodedRequestObj = new URLSearchParams(requestObj);
      const response = await Bridge(
        'read',
        `itemsList?${urlEncodedRequestObj}`
      );
      return response?.err == 'serverError' ? false : response.data;
    }
  );

  const selectRefs = React.useRef<{
    [key: string]: HTMLSelectElement | HTMLInputElement | null;
  }>({}).current;

  const formFieldsRef = React.useRef<null | {
    [key: string]: { tagName: string; props: { [key: string]: string } };
  }>(null);

  const headerFieldsRefs = React.useRef<{
    targetEntity: HTMLSelectElement | null | { [key: string]: string };
    user: HTMLSelectElement | null | { [key: string]: string };
    privilegesCategories: HTMLSelectElement | null | { [key: string]: string };
  } | null>(
    itemsListQuery.data?.length
      ? {
          targetEntity: {
            tagName: 'ListItem',
          },
          user: {
            value: itemsListQuery.data.users[0]?.id,
            innerText: itemsListQuery.data.users[0]?.username,
          },
          privilegesCategories: {
            value: itemsListQuery.data.privilegesCategories[0]?.id,
            innerText: itemsListQuery.data.privilegesCategories[0]?.id,
          },
        }
      : null
  ).current;

  // NO HOOKS BELOW THIS LOGIC BLOCK
  if (itemsListQuery.status != 'success') {
    return <p>I DON'T HAVE A LOADING SPINNER</p>;
  }

  const listRules = () => {
    const data = privilegesQuery.data;
    return (
      <p>
        {privilegesQuery.status == 'success' ? (
          // console.log(privilegesQuery.data);
          data.map((rule) => {
            return (
              <p className='my-5'>
                {Object.keys(rule).map((ruleKey) => {
                  if (rule[ruleKey]) {
                    return (
                      <p>
                        {ruleKey.includes('_FK')
                          ? ruleKey.slice(0, -3)
                          : ruleKey}{' '}
                        : {rule[ruleKey]}
                      </p>
                    );
                  }
                })}
              </p>
            );
          })
        ) : (
          <></>
        )}
      </p>
    );
  };

  const createNewPrivilege = () => {
    // this is the number of lists combined into the first <select> element.
    const firstPartLength = 3;
    const itemsList = Object.fromEntries(
      Object.entries(itemsListQuery.data).splice(0, firstPartLength)
    ) as { [key: string]: string[] };

    formFieldsRef.current = FormFields('privileges', {
      targetEntity: {
        tagName: 'ListInput',
        props: {
          itemsList,
        },
      },
      user: {
        value: itemsListQuery.data.users[0]?.id,
        innerText: itemsListQuery.data.users[0]?.username,
        children: itemsListQuery.data.users.map((item) => {
          return { id: item.id, title: item.username };
        }),
      },
      privilegesCategories: {
        value: itemsListQuery.data.privilegesCategories[0]?.id,
        innerText: itemsListQuery.data.privilegesCategories[0]?.id,
        children: itemsListQuery.data.privilegesCategories.map((item) => {
          return { id: item.id, title: item.id };
        }),
      },
    });

    stateActions.sideForm.show(undefined, 'create');
  };

  const listHeaderFields = () => {
    // this is the number of lists combined into the first <select> element.
    const firstPartLength = 3;

    let targetItemsList = itemsListQuery.data;
    const targetItemsListEntries = Object.entries(targetItemsList);
    const otherItemsList = Object.fromEntries(
      targetItemsListEntries.splice(0, firstPartLength)
    ) as { [key: string]: string[] };
    targetItemsList = Object.fromEntries(targetItemsListEntries);
    // console.log(otherItemsList);
    const targetEntityKey = 'targetEntity';
    return (
      <>
        <input
          list='otherItemsList'
          onChange={() => {
            // TODO: debounce this
            privilegesQuery.refetch();
          }}
          placeholder={targetEntityKey}
          className={tailwindClx.commonBorder}
          name={targetEntityKey}
          ref={(el) => {
            selectRefs[targetEntityKey] = el;
          }}
        />
        <datalist id='otherItemsList'>
          {Object.keys(otherItemsList).map((entityKey: string) => {
            return otherItemsList[entityKey].map(
              (entityOption: { [key: string]: string }) => {
                const entityOptionValues = Object.values(entityOption);
                // console.log(entityOptionValues);
                return (
                  <option
                    key={entityOptionValues[0]}
                    value={`${entityKey} - ${entityOptionValues[1]}`}
                    data-value={entityOptionValues[0]}
                  />
                );
              }
            );
          })}
        </datalist>

        {Object.keys(targetItemsList).map((itemKey) => {
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

              {targetItemsList[itemKey].map(
                (item: { [key: string]: string }) => {
                  const values = Object.values(item);
                  return (
                    <option key={values[0]} value={values[0]}>
                      {values?.[1] ? values[1] : values[0]}
                    </option>
                  );
                }
              )}
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
        <button
          onClick={createNewPrivilege}
          className={`ml-auto bg-primary text-white rounded-md px-2`}
        >
          New
        </button>
      </header>
      <main
        aria-label='portfolios'
        className='text-black mt-[7rem] pl-20 flex gap-6'
      >
        {privilegesQuery.status == 'success' ? listRules() : <></>}
        {state.popup.sideForm.show && privilegesQuery.status == 'success' ? (
          <Form
            fields={formFieldsRef.current}
            mode={state.popup.sideForm.mode}
            route='privileges'
            refetch={privilegesQuery.refetch}
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
