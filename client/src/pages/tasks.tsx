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
    popup: { form: { show: false, mode: 'create', itemID: '' } },
  });
  const stateActions = {
    form: {
      show: (itemID?: string, mode?: 'edit' | 'create') => {
        const stateCpy = { ...state }; // tricking react with a shallow copy

        if (mode == 'edit') {
          if (!itemID) {
            return console.log(
              'err: forgot to include the item id for editing'
            );
          }
          stateCpy.popup.form.mode = mode;
          stateCpy.popup.form.itemID = itemID;
        }

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

  const portfolio_fkSelectRef = React.useRef<HTMLSelectElement | null>(null);
  const project_fkSelectRef = React.useRef<HTMLSelectElement | null>(null);
  const formFieldsRef = React.useRef<{
    [key: string]: { tagName: string; props: { [key: string]: string } };
  }>(
    FormFields('task', {
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
    })
  );

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
    const fields = formFieldsRef.current;
    return Object.keys(fields).map((fieldKey) => {
      let TagName = fields[fieldKey].tagName;
      if (TagName == 'textarea') {
        TagName = 'input';
      }
      return <TagName key={fieldKey} {...fields[fieldKey].props} />;
    });
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
        <main
          aria-label='projects'
          className='text-black px-10 gap-6 grow flex justify-between'
        >
          <section
            aria-label='tasks list'
            className='grow pt-[5rem] flex flex-col'
          >
            {tasksQuery.status == 'success' ? (
              tasksQuery.data.map((task, index) => {
                return (
                  <h3 key={index} className='mt-4'>
                    Task: {task.title}
                  </h3>
                );
              })
            ) : (
              <></>
            )}

            {/* new task button*/}
            <button
              onClick={createNewTask}
              className={`mt-3 w-max pb-1 text-primary text-md capitalize`}
            >
              <span className='text-xl'>+</span> add new task
            </button>
          </section>

          <section
            aria-label='task info'
            className='grow pt-[5rem] pl-4 border-l-primary border-l-2'
          >
            <h2 aria-label='taks title' className={`text-xl`}>
              task title
            </h2>
          </section>
          {state.popup.form.show ? (
            <Form
              fields={formFieldsRef.current}
              mode={state.popup.form.mode}
              itemID={state.popup.form.itemID}
              route={'task'}
              refetch={tasksQuery.refetch}
              hideForm={stateActions.form.hide}
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
