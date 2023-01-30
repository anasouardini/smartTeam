import React, { useEffect } from 'react';
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

  const portfolio_fkSelectRef = React.useRef<HTMLSelectElement|null>(null);
  const formFieldsRef = React.useRef<{}|null>(null);

  const projectsQuery = useQuery('projects', async () => {
    const response = await Bridge('read', `project/all`);
    return response?.err == 'serverError' ? false : response.data;
  });
  if (projectsQuery.status == 'success') {
    console.log(projectsQuery.data);
  }

  const portfoliosListQuery = useQuery('portfolio list', async () => {
    const response = await Bridge('read', `portfolio/list`);
    return response?.err == 'serverError' ? false : response.data;
  });

  const createNewProject = async () => {
    formFieldsRef.current = FormFields('project', {
      portfolio_fk: { props: { defaultValue: portfolio_fkSelectRef.current?.value, readOnly: true } },
      title: 'default',
      description: 'default',
      bgColor: 'default',
      dueDate: 'default',
      status: 'default',
      milestone: 'default',
      budget: 'default',
      expense: 'default',
    });

    stateActions.form.show();
  };

  const tailwindClx = {
    projectBorder: 'border-2 border-primary rounded-md',
    projectItem: `flex items-center justify-center w-[12rem]
                  h-[7rem] text-primary text-2xl`,
  };

  const columns = React.useMemo(
    () => [
      { Header: 'title' },
      { Header: 'description' },
      { Header: 'status' },
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
      <select ref={portfolio_fkSelectRef}>
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
