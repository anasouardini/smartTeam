import React from 'react';
// import { useParams } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';
import { useQuery } from 'react-query';
import Bridge from '../tools/bridge';
import Genid from '../tools/genid';
import Form from '../components/form';
import { FaTrash } from 'react-icons/fa';
import FormFields from '../components/formFields';

type queryT = {
  status: string;
  isLoading: boolean;
  data: {
    portfolios: { [key: string]: any }[];
    projects: { [key: string]: any }[];
    assignees: { id: string; username: string }[];
  };
  refetch: () => void;
};
type propsT = { itemsListQuery: queryT };
const AfterQueryPrep = (props: propsT) => {
  const { loggedInUser } = useOutletContext<{
    loggedInUser: { username: string; id: string };
    isLoggedIn: boolean;
  }>();

  const [state, setState] = React.useState({
    popup: {
      sideForm: { show: false, mode: 'create', itemID: '' },
    },
  });
  const stateActions = {
    sideForm: {
      show: (itemID: string | undefined, mode: 'edit' | 'create') => {
        const stateCpy = structuredClone(state); // tricking react with a shallow copy

        if (mode == 'edit') {
          if (itemID === undefined) {
            return console.log(
              'err: forgot to include the item id for editing'
            );
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

  const headerFieldsRefs = React.useRef<{
    portfolios: HTMLSelectElement | { [key: string]: any };
    projects: HTMLSelectElement | { [key: string]: any };
    assignees: HTMLSelectElement | { [key: string]: any };
  }>({}).current;

  //TODO: needs to be passed separately to the filter header
  // watch out for react-query it doesn handl errors correctly,
  // make sure the fucntion passed actually works before passing it to userQuery.
  const Refs = React.useRef<{
    formFields: {
      [key: string]: { tagName: string; props: { [key: string]: string } };
    };
    formHiddenFields: any;
    selectInputs: any;
  }>({ formFields: {}, formHiddenFields: {}, selectInputs: {} });

  // TODO: extract this to a seperate component
  const tasksQuery = useQuery(
    'projects',
    async () => {
      // when fetching portfolios list give an empty list

      // TODO: server does not filter using portfolio

      const requestObj = {
        portfolio: headerFieldsRefs?.portfolios?.value ??
          props.itemsListQuery.data.portfolios[0].id,
        project: headerFieldsRefs?.projects?.value ??
          props.itemsListQuery.data.projects[0].id,
        users: headerFieldsRefs?.assignees?.value ??
          props.itemsListQuery.data.assignees[0].id
      };
      const profile =
        Refs.current.selectInputs?.profiles?.value ||
        props.itemsListQuery.data?.profiles?.[0]?.id;
      if (profile) {
        requestObj.owner_FK = profile;
      }

      const urlEncodedRequestObj = new URLSearchParams(requestObj);
      const response = await Bridge(
        'read',
        `task/all?${urlEncodedRequestObj}`
      );

      return response?.err == 'serverError' ? false : response.data;
    },
    {
      enabled: !!(
        props.itemsListQuery.data.portfolios.length ||
        props.itemsListQuery.data.projects.length
      ),
    }
  );
  // if (tasksQuery.status == 'success') {
  //   // console.log(tasksQuery.data);
  // }

  const createNewTask = () => {
    Refs.current.formHiddenFields.owner_FK = Refs.current.selectInputs.profiles.value;
    Refs.current.formFields = FormFields('task', {
      portfolio: {
        children: props.itemsListQuery.data.portfolios,
        props: {
          defaultValue: headerFieldsRefs.portfolios?.value,
        },
      },
      project: {
        children: props.itemsListQuery.data.projects,
        props: {
          defaultValue: headerFieldsRefs.projects?.value,
        },
      },
    });

    stateActions.sideForm.show(undefined, 'create');
  };

  const editTask = async (task: { [key: string]: any }) => {
    Refs.current.formHiddenFields.owner_FK = Refs.current.selectInputs.profiles.value;
    Refs.current.formFields = FormFields('task', {
      portfolio: {
        children: props.itemsListQuery.data.portfolios,
        props: {
          defaultValue: headerFieldsRefs.portfolios?.value,
        },
      },
      project: {
        children: props.itemsListQuery.data.projects,
        props: {
          defaultValue: task.project_FK,
        },
      },
      title: { props: { defaultValue: task.title } },
      description: { props: { defaultValue: task.description } },
      bgColor: { props: { defaultValue: task.bgColor } },
      dueDate: { props: { defaultValue: task.dueDate } },
      status: { props: { defaultValue: task.status } },
    });

    stateActions.sideForm.show(task.id, 'edit');
  };

  const removeTask = async (
    id: string,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.stopPropagation();

    const resp = await Bridge('remove', `task`, {
      id,
      owner_FK: Refs.current.selectInputs.profiles.value,
    });

    if (resp.err) {
      console.log(resp);
      return;
    }

    tasksQuery.refetch();
  };

  // TODO: this should be in it's own component
  const listHeaderFields = () => {
    const fields = FormFields('task');
    // console.log(fields);

    return Object.keys(fields).map((fieldKey) => {
      let TagName = fields[fieldKey].tagName;
      if (TagName == 'textarea') {
        TagName = 'input';
      }

      if (
        fields[fieldKey]?.children &&
        props.itemsListQuery.data?.[fieldKey + 's']
      ) {
        return (
          <TagName
            onChange={tasksQuery.refetch}
            key={fieldKey}
            ref={(el) => (headerFieldsRefs[fieldKey + 's'] = el)}
            {...fields[fieldKey].props}
          >
            {props.itemsListQuery.data?.[fieldKey + 's'].map(
              (child: string[]) => {
                return (
                  <option key={child.id} value={child.id}>
                    {child.title ? child.title : child.username}
                  </option>
                );
              }
            )}
          </TagName>
        );
      }

      return (
        <TagName
          key={fieldKey}
          ref={(el) => (headerFieldsRefs[fieldKey + 's'] = el)}
          {...fields[fieldKey].props}
        />
      );
    });
  };

  const listProfiles = () => {
    if (props.itemsListQuery.status != 'success') {
      return (
        <select>
          <option>empty list</option>
        </select>
      );
    }

    const profiles = props.itemsListQuery.data.assignees;
    return (
      <>
        <select
          onChange={() => {
            tasksQuery.refetch();
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

  // tables suck, falling back to DIVs
  //TODO: use grid instead of a table
  const showTaksTable = () => {
    return (
      <div
        aria-label='tasks list'
        className='mt-4 text-left flex flex-col gap-2'
      >
        {tasksQuery.data.map((task, index) => {
          return (
            <div
              onClick={() => editTask(task)}
              key={index}
              className={`px-2 py-1 cursor-pointer hover:border-primary border-[1px] 
                        rounded-md flex justify-between items-center`}
            >
              <h3 key={index}>{task.title}</h3>
              <button onClick={(e) => removeTask(task.id, e)}>
                <FaTrash className={`text-primary`} />
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  // TODO: set default selected item to the last visited one
  // if (props.itemsListQuery.data.portfolios.length === 0) {
  //   return <h1>There are no tasks, you need to create a portfolio first.</h1>;
  // }
  // if (props.itemsListQuery.data.projects.length === 0) {
  //   return <h1>There are no tasks, you need to create a project first.</h1>;
  // }
  return (
    <>
      <div aria-label='container' className={`grow flex flex-col`}>
        <header
          aria-label='filters'
          className={`px-6 py-4 flex flex-wrap gap-4`}
        >
          {listHeaderFields()}
          {listProfiles()}
          <button className={`ml-auto bg-primary text-white rounded-md px-2`}>
            Filter
          </button>
        </header>

        <main aria-label='projects' className='text-black px-2 gap-3 grow flex'>
          <section
            aria-label='tasks list'
            className='grow mt-[2rem] py-4 flex flex-col border-gray-300 border-2 rounded-md px-2'
          >
            <div className={`flex`}>
              <div className={``}>
                <button
                  onClick={createNewTask}
                  className={`text-md text-white bg-primary rounded-md px-2 py-[2px]`}
                >
                  New Task
                </button>
              </div>
            </div>
            {tasksQuery.status == 'success' ? showTaksTable() : <></>}
          </section>

          {state.popup.sideForm.show && tasksQuery.status == 'success' ? (
            <Form
              hiddenFields={Refs.current.formHiddenFields}
              fields={Refs.current.formFields}
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
    </>
  );
};

// react/re-render is making it hard that is why I need to split dependent react-query calls
export default function Tasks() {
  const itemsListQuery = useQuery('portfolios&projects list', async () => {
    const requestObj = {
      portfolios: '',
      projects: '',
      connections: 'assignees',
    };
    const urlEncodedRequestObj = new URLSearchParams(requestObj);
    const response = await Bridge('read', `itemsList?${urlEncodedRequestObj}`);
    return response?.err == 'serverError' ? false : response.data;
  });

  // console.log(portfoliosListQuery.status == 'success');
  // console.log(projectsListQuery.status == 'success');

  if (itemsListQuery.status == 'success') {
    return <AfterQueryPrep itemsListQuery={itemsListQuery} />;
  }

  return <></>;
}
