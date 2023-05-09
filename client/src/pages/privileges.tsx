import React from 'react';
import { useQuery } from 'react-query';
import { useOutletContext } from 'react-router-dom';
import Bridge from '../tools/bridge';
import Genid from '../tools/genid';
import toUrlEncoded from '../tools/toUrlEncoded';
import Form from '../components/form';
import { FaTrash } from 'react-icons/fa';
import FormFields from '../components/formFields';

import {toast} from 'react-toastify';

export default function Privileges() {
  const { loggedInUser } = useOutletContext<{
    loggedInUser: { username: string; id: string };
    isLoggedIn: boolean;
  }>();
  // const [state, setState] = React.useState();
  // const stateActions = {};

  const [state, setState] = React.useState({
    popup: {
      sideForm: { show: false, mode: 'create', itemID: '' },
    },
  });
  const stateActions = {
    sideForm: {
      show: (itemID: string | undefined, mode: 'edit' | 'create') => {
        const stateCpy = structuredClone(state);

        if (mode == 'edit') {
          if (itemID === undefined) {
            toast.error('err: forgot to include the item id for editing')
            return;
          }
          stateCpy.popup.sideForm.itemID = itemID;
        }

        stateCpy.popup.sideForm.show = true;
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

  const Refs = React.useRef<{
    selectInputs: { [key: string]: HTMLSelectElement | HTMLInputElement };
    globalFilter: string;
    formHiddenFields: { owner_FK: string };
    formFields: null | {
      [key: string]: { tagName: string; props: { [key: string]: string } };
    }
  }>({
    formFields: null,
    selectInputs: {},
    globalFilter: loggedInUser.id,
    formHiddenFields: { owner_FK: '' },
  });


  const tailwindClx = {
    commonBorder: `border-2 border-primary rounded-md px-1 py-1`,
  };

  const itemsListQuery = useQuery(
    'connections&portfolios&projects&tasks&privilegesCategories list',
    async () => {
      // console.log('itemsListQuery', Refs.current.globalFilter)
      // order matters
      const requestObj = {
        items: {
          portfolios: {
            name: 'portfolios',
            filter: { owner_FK: Refs.current.globalFilter },
          },
          projects: {
            name: 'projects',
            filter: { owner_FK: Refs.current.globalFilter },
          },
          tasks: {
            name: 'tasks',
            filter: { owner_FK: Refs.current.globalFilter },
          },
          users: {
            name: 'connections',
            filter: { userID: Refs.current.globalFilter },
          },
          privilegesCategories: {
            name: 'privilegesCategories',
            filter: { owner_FK: Refs.current.globalFilter },
          },
          profiles: {
            name: 'connections',
            filter: {},
          },
        },
      };
      const response = await Bridge('post', `itemsList`, requestObj);
      return response?.err == 'serverError' ? false : response.data;
    }
  );
  // if(itemsListQuery.status == 'success'){
  //   console.log(itemsListQuery.data)
  // }

  const privilegesQuery = useQuery('privileges', async () => {
    const queryFilter = Object.keys(Refs.current.selectInputs).reduce<{
      [key: string]: string | undefined;
    }>((acc, refKey) => {
      if (refKey === 'targetEntity') {
        const selectedValue = Refs.current.selectInputs[refKey]?.value;
        if (selectedValue) {
          const listID =
            Refs.current.selectInputs[refKey]?.getAttribute('list');
          acc[refKey] = {
            type: selectedValue.split(' - ')[0].slice(0, -1) + '_FK',
            value:
              document.querySelector(
                `#${listID} option[value='${selectedValue}']`
              )?.dataset?.value,
          };
        }
        return acc;
      }
      acc[refKey] = Refs.current.selectInputs[refKey]?.value
      return acc;
    }, {});
    // console.log(queryFilter);

    const profile =
      Refs.current.selectInputs?.profiles?.value ||
      itemsListQuery.data?.profiles?.[0]?.id;
    if (profile) {
      queryFilter.owner_FK = profile;
    }
    let response = await Bridge('post', `privileges/all`, queryFilter);
    return !response || response?.err == 'serverError' ? false : response.data;
  }, {enabled: !!(itemsListQuery?.data?.profiles?.length)});


  if(privilegesQuery.status == 'success'){
    // updating fieldds for the form
    const currentItem = privilegesQuery.data.filter((item:{[key: string]: any})=>item.id == state.popup.sideForm.itemID)[0]
    if(currentItem && Object.keys(currentItem).length){
      Refs.current.formHiddenFields.owner_FK =
        Refs.current.selectInputs.profiles.value;
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
          if (currentItem[selectedItemKey]) {
            acc = `${itemKey} - ${
              itemsList[itemKey].filter(
                (item) => item.id == [currentItem[selectedItemKey]]
              )[0].title
            }`;
            // console.log(acc);
          }
          return acc;
        },
        ''
      );

      Refs.current.formFields = FormFields('privileges', {
        targetEntity: {
          tagName: 'ListInput',
          props: {
            defaultValue: selectedTargetEntity,
            itemsList,
          },
        },
        user: {
          props: {
            defaultValue: currentItem.user,
          },
          children: itemsListQuery.data.users.map((item) => {
            return { id: item.id, title: item.username };
          }),
        },
        privilegesCategories: {
          props: {
            defaultValue: currentItem.privCat_FK,
          },
          children: itemsListQuery.data.privilegesCategories.map((item) => {
            return { id: item.id, title: item.id };
          }),
        },
      });
      }
  }


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
          data.map((rule, index) => {
            // console.log(privilegesQuery.data);
            return (
              <div
                onClick={(e) => {
                  if (e.target == e.currentTarget) {
                    editPrivileges(rule);
                  }
                }}
                key={index}
                className={`px-2 py-1 cursor-pointer hover:border-primary border-[1px] 
                        rounded-md flex justify-between items-center`}
              >
                <h3 key={index}>
                  {
                    itemsListQuery.data.users.filter(
                      (user) => user.id == rule.user
                    )?.[0]?.username
                  }
                </h3>

                <button onClick={(e) => removePrivilege(rule, e)}>
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
    Refs.current.formHiddenFields.owner_FK =
      Refs.current.selectInputs.profiles.value;
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

    Refs.current.formFields = FormFields('privileges', {
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
    const parentsExist = itemsListQuery?.data?.profiles?.length;
    if(!parentsExist){
      toast.error('You have to add a user to your organization first. Click on profile tab.');
      return;
    }
    Refs.current.formHiddenFields.owner_FK =
      Refs.current.selectInputs.profiles.value;
    // this is the number of lists combined into the first <select> element.
    const firstPartLength = 3;
    const itemsList = Object.fromEntries(
      Object.entries(itemsListQuery.data).splice(0, firstPartLength)
    ) as { [key: string]: string[] };

    Refs.current.formFields = FormFields('privileges', {
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

  const removePrivilege = async (item, e) => {
    const resp = await Bridge('remove', 'privileges', {
      id: item.id,
      owner_FK: Refs.current.selectInputs.profiles.value,
    });
    if (resp.err) {
      toast.error(resp)
    } else {
      privilegesQuery.refetch();
    }
  };

  const listProfiles = () => {
    if (itemsListQuery.status != 'success') {
      return (
        <select key='profilesDropDown'>
          <option>empty list</option>
        </select>
      );
    }

    const profiles = itemsListQuery.data.profiles;
    return (
      <>
        <select
          key='profilesDropDown'
          onChange={(e) => {
            Refs.current.globalFilter = e.target.value;
            itemsListQuery.refetch();
            privilegesQuery.refetch();
          }}
          className={`ml-auto`}
          ref={(el) => {
            Refs.current.selectInputs.profiles = el;
          }}
        >
          <option key='loggedInUserOption' value={loggedInUser.id}>
            {loggedInUser.username}
          </option>
          {profiles.map((profile: { id: string; username: string }) => {
            return (
              <option key={profile.id} value={profile.id}>
                {profile.username}
              </option>
            );
          })}
        </select>
      </>
    );
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
    // console.log(targetItemsList)
    const targetEntityKey = 'targetEntity';
    return (
      <>
        <input
          list='otherItemsList'
          onChange={() => {
            // TODO: debounce this
            privilegesQuery.refetch();
          }}
          placeholder={
            Object.keys(otherItemsList).length
              ? targetEntityKey
              : 'List is empty'
          }
          className={tailwindClx.commonBorder}
          autoComplete='off'
          name={targetEntityKey}
          ref={(el) => {
            Refs.current.selectInputs[targetEntityKey] = el;
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
          if (itemKey === 'profiles') {
            return listProfiles();
          }
          return (
            <select
              onChange={() => {
                privilegesQuery.refetch();
              }}
              className={tailwindClx.commonBorder}
              key={itemKey}
              name={itemKey}
              ref={(el) => {
                Refs.current.selectInputs[itemKey] = el;
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
        <button className={`ml-auto bg-primary text-white rounded-md px-2`}>
          Filter
        </button>
      </header>
      <main
        aria-label='portfolios'
        className='text-black px-2 pb-3 grow flex gap-3'
      >
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
            hiddenFields={Refs.current.formHiddenFields}
            owner={{
              ThisIsABetterWayToDoThis: 'use this instead of hidden fields',
            }}
            fields={Refs.current.formFields}
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
