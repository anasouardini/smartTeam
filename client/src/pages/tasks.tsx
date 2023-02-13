import React from 'react';
// import { useParams } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';
import { useQuery } from 'react-query';
import Bridge from '../tools/bridge';
import Genid from '../tools/genid';
import SideForm from '../components/sideForm';
import { FaTrash } from 'react-icons/fa';
import { useTable } from 'react-table';
import FormFields from '../components/formFields';

type queryT = {
  status: string;
  isLoading: boolean;
  data: { [key: string]: any };
  refetch: () => void;
};
type propsT = { portfoliosListQuery: queryT; projectsListQuery: queryT };
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

  const portfolio_fkSelectRef = React.useRef<HTMLSelectElement | null>(null);
  const project_fkSelectRef = React.useRef<HTMLSelectElement | null>(null);

  //TODO: needs to be passed separately to the filter header
  const formFieldsRef = React.useRef<null | {
    [key: string]: { tagName: string; props: { [key: string]: string } };
  }>(null);

  // TODO: extract this to a seperate component
  const tasksQuery = useQuery('projects', async () => {
    const response = await Bridge(
      'read',
      `task/all?portfolio_fk=${
        portfolio_fkSelectRef.current?.value ??
        props.portfoliosListQuery.data[0]
      }&project_fk=${
        project_fkSelectRef.current?.value ?? props.projectsListQuery.data[0]
      }`
    );
    return response?.err == 'serverError' ? false : response.data;
  });
  // if (tasksQuery.status == 'success') {
  //   console.log(tasksQuery.data);
  // }

  const tailwindClx = {};

  const createNewTask = () => {
    formFieldsRef.current = FormFields('task', {
      portfolio_fk: {
        children: [
          [
            portfolio_fkSelectRef.current?.value,
            portfolio_fkSelectRef.current?.innerText,
          ],
          ['key2', 'value2'],
        ],
        props: {
          defaultValue: portfolio_fkSelectRef.current?.innerText,
          readOnly: true,
        },
      },
      project_fk: {
        children: [
          [
            project_fkSelectRef.current?.value,
            project_fkSelectRef.current?.innerText,
          ],
          ['key2', 'value2'],
        ],
        props: {
          defaultValue: project_fkSelectRef.current?.innerText,
          readOnly: true,
        },
      },
      assignee_fk: {
        children: [
          [loggedInUser.id, loggedInUser.username],
          ['key2', 'value2'],
        ],
        props: {
          defaultValue: loggedInUser.id,
          readOnly: true,
        },
      },
      title: 'default',
      description: 'default',
      bgColor: 'default',
      dueDate: 'default',
      status: 'default',
    });

    stateActions.sideForm.show(undefined, 'create');
  };

  const editTask = async (task: { [key: string]: any }) => {
    formFieldsRef.current = FormFields('task', {
      portfolio_fk: {
        children: [
          [
            portfolio_fkSelectRef.current?.value,
            portfolio_fkSelectRef.current?.innerText,
          ],
          ['key2', 'value2'],
        ],
        props: {
          defaultValue: portfolio_fkSelectRef.current?.innerText,
        },
      },
      project_fk: {
        children: [
          [
            project_fkSelectRef.current?.value,
            project_fkSelectRef.current?.innerText,
          ],
          ['key2', 'value2'],
        ],
        props: {
          defaultValue: project_fkSelectRef.current?.innerText,
        },
      },
      assignee_fk: {
        children: [
          [loggedInUser.id, loggedInUser.username],
          ['key2', 'value2'],
        ],
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

  const removeTask = async (id: string, e:React.MouseEvent<HTMLButtonElement>) => {
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
    const fields = FormFields('task', {
      // assignee_fk:{
      //   props: {
      //     defaultValue: loggedInUser.id,
      //     readOnly: true,
      //   },
      // },
      title: 'default',
      description: 'default',
      bgColor: 'default',
      dueDate: 'default',
      status: 'default',
    });

    return Object.keys(fields).map((fieldKey) => {
      let TagName = fields[fieldKey].tagName;
      if (TagName == 'textarea') {
        TagName = 'input';
      }
      return <TagName key={fieldKey} {...fields[fieldKey].props} />;
    });
  };

  // tables suck, falling back to DIVs
  //TODO: use grid instead of a table
  const showTaksTable = () => {
    return (
      <div
        aria-label='tasks table'
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
  return (
    <>
      <div aria-label='container' className={`grow flex flex-col`}>
        <header
          aria-label='filters'
          className={`px-6 py-4 flex flex-wrap gap-4`}
        >
          <select
            ref={portfolio_fkSelectRef}
            onChange={tasksQuery.refetch}
            className={`w-max`}
          >
            {props.portfoliosListQuery.data.map(
              (portfolio: { id: string; title: string }) => (
                <option key={portfolio.id} value={portfolio.id}>
                  {portfolio.title}
                </option>
              )
            )}
          </select>
          <select
            ref={project_fkSelectRef}
            onChange={tasksQuery.refetch}
            className={`w-max`}
          >
            {props.projectsListQuery.data.map(
              (project: { id: string; title: string }) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              )
            )}
          </select>
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

          {state.popup.sideForm.show &&
          tasksQuery.status == 'success' ? (
            <SideForm
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
  const portfoliosListQuery = useQuery('portfolio list', async () => {
    const response = await Bridge('read', `portfolio/list`);
    return response?.err == 'serverError' ? false : response.data;
  });

  const projectsListQuery = useQuery('project list', async () => {
    const response = await Bridge('read', `project/list`);
    return response?.err == 'serverError' ? false : response.data;
  });

  // console.log(portfoliosListQuery.status == 'success');
  // console.log(projectsListQuery.status == 'success');

  if (
    portfoliosListQuery.status == 'success' &&
    projectsListQuery.status == 'success'
  )
    return (
      <AfterQueryPrep
        portfoliosListQuery={portfoliosListQuery}
        projectsListQuery={projectsListQuery}
      />
    );

  return <></>;
}
