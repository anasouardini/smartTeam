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
    portfolios: { [key: string]: any };
    projects: { [key: string]: any };
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

  const headerFieldsRefs = React.useRef<{
    portfolio: HTMLSelectElement | null | { value: string };
    project: HTMLSelectElement | null | { value: string };
    assignee: HTMLSelectElement | null | { value: string };
  } | null>(
    props.itemsListQuery.data.portfolios.length
      ? {
          portfolio: {
            value: props.itemsListQuery.data.portfolios[0].id,
            innerText: props.itemsListQuery.data.portfolios[0].title,
          },
          project: {
            value: props.itemsListQuery.data.projects[0]?.id,
            innerText: props.itemsListQuery.data.projects[0]?.title,
          },
          assignee: null,
        }
      : null
  ).current;

  //TODO: needs to be passed separately to the filter header
  const formFieldsRef = React.useRef<null | {
    [key: string]: { tagName: string; props: { [key: string]: string } };
  }>(null);

  // TODO: extract this to a seperate component
  const tasksQuery = useQuery('projects', async () => {
    // when fetching portfolios list give an empty list

    if (
      props.itemsListQuery.data.portfolios.length === 0 ||
      props.itemsListQuery.data.projects.length === 0
    ) {
      return false;
    }

    const response = await Bridge(
      'read',
      `task/all?portfolio=${
        headerFieldsRefs?.portfolio?.value ??
        props.itemsListQuery.data.portfolios[0]
      }&project=${
        headerFieldsRefs.project?.value ?? props.itemsListQuery.data.projects[0]
      }`
    );

    return response?.err == 'serverError' ? false : response.data;
  });
  // if (tasksQuery.status == 'success') {
  //   // console.log(tasksQuery.data);
  // }

  // TODO: children should be a map from the fetched list
  const createNewTask = () => {
    formFieldsRef.current = FormFields('task', {
      portfolio: {
        children: [
          {
            id: headerFieldsRefs.portfolio?.value,
            title: headerFieldsRefs.portfolio?.innerText,
          },
        ],
        props: {
          defaultValue: headerFieldsRefs.portfolio?.value,
        },
      },
      project: {
        children: [
          {
            id: headerFieldsRefs.project?.value,
            title: headerFieldsRefs.project?.innerText,
          },
        ],
        props: {
          defaultValue: headerFieldsRefs.project?.value,
        },
      },
      assignee: {
        children: [{ id: loggedInUser.id, title: loggedInUser.username }],
        props: {
          defaultValue: loggedInUser.id,
          readOnly: true,
        },
      },
    });

    stateActions.sideForm.show(undefined, 'create');
  };

  const editTask = async (task: { [key: string]: any }) => {
    formFieldsRef.current = FormFields('task', {
      portfolio: {
        children: [
          {
            id: headerFieldsRefs.portfolio?.value,
            title: headerFieldsRefs.portfolio?.innerText,
          },
        ],
        props: {
          defaultValue: headerFieldsRefs.portfolio?.value,
        },
      },
      project: {
        children: [
          {
            id: headerFieldsRefs.project?.value,
            title: headerFieldsRefs.project?.innerText,
          },
        ],
        props: {
          defaultValue: headerFieldsRefs.project?.value,
        },
      },
      assignee: {
        children: [{ id: loggedInUser.id, title: loggedInUser.username }],
        props: {
          defaultValue: loggedInUser.id,
          readOnly: true,
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
    });

    if (resp.err) {
      console.log(resp);
      return;
    }

    tasksQuery.refetch();
  };

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
                    {child.title}
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
  if (props.itemsListQuery.data.portfolios.length === 0) {
    return <h1>There are no tasks, you need to create a portfolio first.</h1>;
  }
  if (props.itemsListQuery.data.projects.length === 0) {
    return <h1>There are no tasks, you need to create a project first.</h1>;
  }
  return (
    <>
      <div aria-label='container' className={`grow flex flex-col`}>
        <header
          aria-label='filters'
          className={`px-6 py-4 flex flex-wrap gap-4`}
        >
          {listHeaderFields()}
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
    </>
  );
};

// react/re-render is making it hard that is why I need to split dependent react-query calls
export default function Tasks() {
  const itemsListQuery = useQuery('portfolios&projects list', async () => {
    const requestObj = { portfolios: '', projects: '' };
    const urlEncodedRequestObj = new URLSearchParams(requestObj);
    const response = await Bridge('read', `itemsList?${urlEncodedRequestObj}`);
    return response?.err == 'serverError' ? false : response.data;
  });

  // console.log(portfoliosListQuery.status == 'success');
  // console.log(projectsListQuery.status == 'success');

  if (itemsListQuery.status == 'success') {
    // console.log(itemsListQuery.data);
    return <AfterQueryPrep itemsListQuery={itemsListQuery} />;
  }

  return <></>;
}
