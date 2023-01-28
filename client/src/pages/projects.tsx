import React from 'react';
// import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import Bridge from '../tools/bridge';
import Genid from '../tools/genid';
import Project from '../components/project';
import Form from '../components/form';
import { useTable } from 'react-table';
import genid from '../tools/genid';
import FormFields from '../components/formFields';

export default function Projects() {
  // const params = useParams();

  const [state, setState] = React.useState({
    popup: { form: { show: false, mode: 'create' } },
  });
  const stateActions = {
    form: {
      show: () => {
        const stateCpy = { ...state }; // tricking react with a shallow copy
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

  // TODO: specify readonly for portfolioID
  const formFieldsRef = React.useRef(
    FormFields('project', {
      title: 'default',
      description: 'default',
      bgColor: 'default',
      dueDate: 'default',
      status: 'default',
      milestone: 'default',
      budget: 'default',
      expense: 'default',
    })
  ).current;

  const projectsQuery = useQuery('projects', async () => {
    const response = await Bridge('read', `project/all`);
    return response?.err == 'serverError' ? false : response.data;
  });
  const portfoliosListQuery = useQuery('portfolio list', async () => {
    const response = await Bridge('read', `portfolio/list`);
    return response?.err == 'serverError' ? false : response.data;
  });

  type projectsResponseT = {
    id: string;
    projectsNumber: number;
    doneProjectsNumber: number;
    title: string;
    description: string;
    bgImg: string;
    status: 'todo' | 'in progress' | 'done';
    progress: number;
  };

  const createNewProject = async () => {
    stateActions.form.show();
  };

  const tailwindClx = {
    projectBorder: 'border-2 border-primary rounded-md',
    projectItem: `flex items-center justify-center w-[12rem]
                  h-[7rem] text-primary text-2xl`,
  };

  const columns = React.useMemo(
    () => [
      { Header: 'sldfkj', accessor: 'key' },
      { Header: 'sldfkj2', accessor: 'key1' },
      { Header: 'button', accessor: 'key3' },
    ],
    []
  );
  const data = React.useMemo(
    () => [
      {
        key: 'sldf sdf lsdfl jsdlkfj sd kj',
        key1: 'lkjsdf',
        key3: <button>sdflj</button>,
      },
      { key: 'sldfkj', key1: 'lkjsdf' },
    ],
    []
  );
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data });
  const mountProjectsTable = () => {
    return (
      <table
        aria-label='projects'
        {...getTableProps()}
        className={`mb-8 w-max`}
      >
        <thead
          className={`border-2 border-primary rounded-md px-3 py-1 text-left`}
        >
          {headerGroups.map((row) => (
            <tr {...row.getHeaderGroupProps()} className={``}>
              {row.headers.map((header) => (
                <th {...header.getHeaderProps} className={`px-4`}>
                  {header.render('Header')}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()} className={``}>
          {rows.map((row) => {
            prepareRow(row);
            return (
              <Project
                key={`${Genid(20)}`}
                row={row}
                refetch={projectsQuery.refetch}
              />
            );
          })}
        </tbody>
      </table>
    );
  };

  if (projectsQuery.isLoading || portfoliosListQuery.isLoading) {
    return <></>;
  }

  return (
    <main
      aria-label='projects'
      className='text-black mt-[7rem] px-10 gap-6 grow'
    >
      <select>
        {portfoliosListQuery.data.map(
          (portfolio: { id: string; title: string }) => (
            <option value={portfolio.id}>{portfolio.title}</option>
          )
        )}
      </select>

      {mountProjectsTable()}

      {/* new project button*/}
      <button
        onClick={createNewProject}
        className={`${tailwindClx.projectBorder} block w-full text-primary text-lg capitalize`}
      >
        <span className='text-2xl'>+</span> add new project
      </button>

      {state.popup.form.show ? (
        <Form
          fields={formFieldsRef}
          mode={state.popup.form.mode}
          route={'project'}
          refetch={projectsQuery.refetch}
          hideForm={stateActions.form.hide}
        />
      ) : (
        <></>
      )}
    </main>
  );
}
