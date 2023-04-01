import React from 'react';
import { useQuery } from 'react-query';
import Bridge from '../tools/bridge';
import Genid from '../tools/genid';
import toUrlEncoded from '../tools/toUrlEncoded';
import Form from '../components/form';
import { FaTrash } from 'react-icons/fa';
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

  const listPrivilegesRules = () => {
    const data = privilegesQuery.data;
    return (
      <div
        aria-label='privileges list'
        className='mt-4 text-left flex flex-col gap-2'
      >
        {privilegesQuery.status == 'success' ? (
          // console.log(privilegesQuery.data);
          data.map((rule, index) => {
            return (
              <div
                onClick={() => editPrivileges(rule)}
                key={index}
                className={`px-2 py-1 cursor-pointer hover:border-primary border-[1px] 
                        rounded-md flex justify-between items-center`}
              >
                <h3 key={index}>{rule.user}</h3>

                <button onClick={(e) => removePrivilege(rule.id, e)}>
                  <FaTrash className={`text-primary`} />
                </button>
              </div>
            );
          })
        ) : (
          <></>
        )}
      </div>
    );
  };

  const editPrivileges = (privilegeRule) => {
    // console.log(privilegeRule);

    const firstPartLength = 3;
    const itemsList = Object.fromEntries(
      Object.entries(itemsListQuery.data).splice(0, firstPartLength)
    ) as { [key: string]: string[] };
    // console.log('itemslist', itemsList)

    // This is a mess, I need to refactor this
    const selectedTargetEntity = Object.keys(itemsList).reduce(
      (acc, itemKey) => {
        // console.log(privilegeRule[itemKey.slice(0, -1)+'_FK'], itemKey.slice(0, -1)+'_FK')
        const selectedItemKey = itemKey.slice(0, -1) + '_FK';
        if (privilegeRule[selectedItemKey]) {
          acc = `${itemKey} - ${
            itemsList[itemKey].filter(
              (item) => item.id == [privilegeRule[selectedItemKey]]
            )[0].title
          }`;
          // console.log(acc);
        }
        return acc;
      },
      ''
    );
    // console.log(selectedTargetEntity);

    formFieldsRef.current = FormFields('privileges', {
      targetEntity: {
        tagName: 'ListInput',
        props: {
          defaultValue: selectedTargetEntity,
          itemsList,
        },
      },
      user: {
        props: {
          defaultValue: privilegeRule.user,
        },
        children: itemsListQuery.data.users.map((item) => {
          return { id: item.id, title: item.username };
        }),
      },
      privilegesCategories: {
        props: {
          defaultValue: privilegeRule.privCat_FK,
        },
        children: itemsListQuery.data.privilegesCategories.map((item) => {
          return { id: item.id, title: item.id };
        }),
      },
    });

    stateActions.sideForm.show(privilegeRule.id, 'edit');
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
        rops: {
          defaultValue: itemsListQuery.data.users[0]?.id,
        },
        children: itemsListQuery.data.users.map((item) => {
          return { id: item.id, title: item.username };
        }),
      },
      privilegesCategories: {
        prop: {
          defaultValue: itemsListQuery.data.privilegesCategories[0]?.id,
        },
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
          className={`ml-auto bg-primary text-white rounded-md px-2`}
        >
          Filter
        </button>
      </header>
      <main aria-label='portfolios' className='text-black px-2 pb-3 grow flex gap-3'>
        <section
          aria-label='tasks list'
          className='grow mt-[2rem] py-4 flex flex-col border-gray-300 border-2 rounded-md px-2'
        >
          <div className={`flex`}>
            <div className={``}>
              <button
                onClick={createNewPrivilege}
                className={`text-md text-white bg-primary rounded-md px-2 py-[2px]`}
              >
                New Privilege
              </button>
            </div>
          </div>
          {privilegesQuery.status == 'success' ? listPrivilegesRules() : <></>}
        </section>
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
