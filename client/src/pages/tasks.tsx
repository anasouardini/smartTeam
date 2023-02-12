import React from 'react';
// import { useParams } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';
import { useQuery } from 'react-query';
import Bridge from '../tools/bridge';
import Genid from '../tools/genid';
import Form from '../components/form';
import { FaPen, FaTrash } from 'react-icons/fa';
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
    popup: { sideForm: { show: true, mode: 'create', itemIndex: 0 } },
  });
  const stateActions = {
    form: {
      show: (itemID?: number, mode?: 'edit' | 'create') => {
        const stateCpy = { ...state }; // tricking react with a shallow copy

        if (mode == 'edit') {
          if (!itemID) {
            return console.log(
              'err: forgot to include the item id for editing'
            );
          }
          stateCpy.popup.sideForm.mode = mode;
          stateCpy.popup.sideForm.itemIndex = itemID;
        }

        stateCpy.popup.sideForm.show = true;
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
        props: {
          defaultValue: portfolio_fkSelectRef.current?.value,
          readOnly: true,
        },
      },
      project_fk: {
        props: {
          defaultValue: project_fkSelectRef.current?.value,
          readOnly: true,
        },
      },
      assignee_fk: {
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

    stateActions.form.show();
  };

  const editTask = (project: { [key: string]: any }) => {
    formFieldsRef.current = FormFields('project', {
      portfolio_fk: {
        props: {
          defaultValue: portfolio_fkSelectRef.current?.value,
        },
      },
      project_fk: {
        props: {
          defaultValue: project_fkSelectRef.current?.value,
        },
      },
      title: { props: { defaultValue: project.title } },
      description: { props: { defaultValue: project.description } },
      bgColor: { props: { defaultValue: project.bgColor } },
      dueDate: { props: { defaultValue: project.dueDate } },
      status: { props: { defaultValue: project.status } },
      milestone: { props: { defaultValue: project.milestone } },
      budget: { props: { defaultValue: project.budget } },
      expense: { props: { defaultValue: project.expense } },
    });

    stateActions.form.show(project.id, 'edit');
  };

  const editTaskField = async (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    let value = e.target.value;
    const name = e.target.name;

    if (name == 'dueDate') {
      value += ':00';
    }

    console.log(value);

    const index = state.popup.sideForm.itemIndex;
    const currentTask = tasksQuery.data[index];

    // if the value hasn't changed just abort
    if (currentTask[name] == value) {
      return;
    }

    const userUpdateResp = await Bridge('update', `task`, {
      id: currentTask.id,
      [name]: value,
    });
    console.log(userUpdateResp);
  };

  const removeTask = async (id: string) => {
    const resp = await Bridge('remove', `project`, {
      id,
    });

    if (resp.err) {
      console.log(resp);
      return;
    }

    tasksQuery.refetch();
  };

  const listFields = () => {
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

  const listSideTaskFields = () => {
    const index = state.popup.sideForm.itemIndex;
    const currentTask = tasksQuery.data[index];
    // console.log(currentTask);

    // mysql2 misses dates by addin gone hour. hence this mess
    // basically adding an hour to the date using string manupulation
    // because JS handles dates poorly
    const newDate: { [key: string]: string } = {};
    Object.keys(currentTask).forEach((itemKey) => {
      if (itemKey.includes('Date') || itemKey.includes('date')) {
        // console.log(currentTask[itemKey], '--------')
        const hourPlusOne =
          parseInt(currentTask[itemKey].split('T')[1].split(':')[0]) + 1;
        const item = currentTask[itemKey];
        const firstPart = item.slice(0, item.indexOf('T') + 1);
        const secondPart = item.slice(item.indexOf(':'));
        const result = `${firstPart}${`0${hourPlusOne}`.slice(
          -2
        )}${secondPart}`;

        // console.log(hourPlusOne)
        // console.log(result)
        newDate[itemKey] = result.split('.')[0];
        // currentTask[itemKey] = result;
      }
    });

    // console.log(newDate.dueDate, 'last');

    return (
      <section
        aria-label='task info'
        className='grow mt-[2rem] py-3 px-2 border-gray-300 border-2 rounded-md'
      >
        <>
          <div className={`flex flex-col gap-6`}>
            <label className={`max-w-max`}>
              title:
              <input
                onBlur={editTaskField}
                name='title'
                type='text'
                className='ml-5 px-2 py-1 border-b-2 border-b-primary'
                defaultValue={currentTask.title}
              />
            </label>
            <label className={`max-w-max`}>
              background color:
              <input
                onBlur={editTaskField}
                name='bgColor'
                type='color'
                className='ml-5 px-2 py-1'
                defaultValue={currentTask.bgColor}
              />
            </label>
            <label className={`max-w-max`}>
              due date:
              <input
                onBlur={editTaskField}
                name='dueDate'
                type='datetime-local'
                className='ml-5 px-2 py-1'
                defaultValue={newDate.dueDate}
              />
            </label>
            <label>
              description:
              <textarea
                onBlur={editTaskField}
                name='description'
                className='mt-4 px-2 py-1 border-[1px] border-gray-300 block w-full'
                defaultValue={currentTask.description}
              />
            </label>
          </div>
        </>
      </section>
    );
  };

  // tables suck, falling back to DIVs
  //TODO: use grid instead of a table
  const showTaksTale = () => {
    return (
      <div aria-label='tasks table' className='text-left flex flex-col gap-2'>
        <div className={`flex`}>
          <div className={``}>
            <button
              className={`text-md text-white bg-primary rounded-md px-2 py-[2px]`}
            >
              New Task
            </button>
          </div>
        </div>
        {tasksQuery.data.map((task, index) => {
          return (
            <div className={`hover:border-primary border-[1px] rounded-md`}>
              {tasksQuery.data.map((task, index) => {
                return (
                  <>
                    <input
                      type='text'
                      key={index}
                      className='px-2 py-1'
                      defaultValue={task.title}
                    />
                  </>
                );
              })}
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
          {listFields()}
          <button className={`ml-auto bg-primary text-white rounded-md px-2`}>
            Filter
          </button>
        </header>

        <main aria-label='projects' className='text-black px-2 gap-3 grow flex'>
          <section
            aria-label='tasks list'
            className='grow mt-[2rem] py-4 flex flex-col border-gray-300 border-2 rounded-md px-2'
          >
            {tasksQuery.status == 'success' ? showTaksTale() : <></>}

            {/* new task button*/}
            <button
              onClick={createNewTask}
              className={`mt-3 w-max pb-1 text-primary text-md capitalize`}
            >
              <span className='text-xl'>+</span> add new task
            </button>
          </section>

          {state.popup.sideForm.show &&
          tasksQuery.status == 'success' &&
          tasksQuery.data.length ? (
            listSideTaskFields()
          ) : (
            <></>
          )}
        </main>
      </div>
    </>
  );
};

// react/re-render is making it hard that is why I need to split dependent react-query calls
export default function Projects() {
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
