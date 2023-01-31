import React from 'react';
// import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import Bridge from '../tools/bridge';
import Genid from '../tools/genid';
import Project from '../components/project';
import Form from '../components/form';
import { useTable } from 'react-table';
import FormFields from '../components/formFields';

type queryT = {
  status: string;
  isLoading: boolean;
  data: { [key: string]: any };
  refetch: () => void;
};
type propsT = { portfoliosListQuery: queryT };

const AfterQueryPrep = (props: propsT) => {
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

  const portfolio_fkSelectRef = React.useRef<HTMLSelectElement | null>(null);
  const formFieldsRef = React.useRef<{} | null>(null);

  // TODO: extract this to a seperate component
  const projectsQuery = useQuery('projects', async () => {
    const response = await Bridge(
      'read',
      `project/all?portfolio_fk=${
        portfolio_fkSelectRef.current?.value ??
        props.portfoliosListQuery.data[0]
      }`
    );
    return response?.err == 'serverError' ? false : response.data;
  });
  // if (projectsQuery.status == 'success') {
  //   console.log(projectsQuery.data);
  // }

  const tailwindClx = {
    projectBorder: 'border-2 border-primary rounded-md',
    projectItem: `flex items-center justify-center w-[12rem]
                  h-[7rem] text-primary text-2xl`,
  };

  const createNewProject = async () => {
    formFieldsRef.current = FormFields('project', {
      portfolio_fk: {
        props: {
          defaultValue: portfolio_fkSelectRef.current?.value,
          readOnly: true,
        },
      },
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

  let columns = React.useMemo(() => {
    if (projectsQuery.status == 'success') {
      // console.log('query', projectsQuery.data);
      if (projectsQuery.data.length) {
        return Object.keys(projectsQuery.data[0])
          .filter((projectKey) =>
            projectKey != 'id' && projectKey != 'portfolio_fk' ? true : false
          )
          .map((projectKey) => ({
            Header: projectKey,
            accessor: projectKey,
          }));
      }
      return [{ Header: 'no data to list', accessor: 'key' }];
    }

    return [{ Header: 'prending...', accessor: 'key' }];
  }, [projectsQuery.status, projectsQuery.dataUpdatedAt]);

  let data = React.useMemo(() => {
    if (projectsQuery.status == 'success') {
      return projectsQuery.data.map((project: { [key: string]: any }) => {
        const newProject = { ...project };
        delete newProject.id;
        delete newProject.portfolio_fk;
        newProject.createDate = new Date(newProject.createDate).toDateString();
        return newProject;
      });
    }

    return [{ key: 'pending...' }];
  }, [projectsQuery.status, projectsQuery.dataUpdatedAt]);

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

  return (
    <main
      aria-label='projects'
      className='text-black mt-[7rem] px-10 gap-6 grow flex flex-col items-center'
    >
      <select ref={portfolio_fkSelectRef} className={`w-max`}>
        {props.portfoliosListQuery.data.map(
          (portfolio: { id: string; title: string }) => (
            <option value={portfolio.id}>{portfolio.title}</option>
          )
        )}
      </select>

      {mountProjectsTable()}

      {/* new project button*/}
      <button
        onClick={createNewProject}
        className={`${tailwindClx.projectBorder} w-max px-3 py-1 text-primary text-lg capitalize`}
      >
        <span className='text-2xl'>+</span> add new project
      </button>

      {state.popup.form.show ? (
        <Form
          fields={formFieldsRef.current}
          mode={state.popup.form.mode}
          route={'project'}
          refetch={() => projectsQuery.refetch}
          hideForm={stateActions.form.hide}
        />
      ) : (
        <></>
      )}
    </main>
  );
};

// react/re-render is making it hard that is why I need to split dependent react-query calls
export default function Projects() {
  const portfoliosListQuery = useQuery('portfolio list', async () => {
    const response = await Bridge('read', `portfolio/list`);
    return response?.err == 'serverError' ? false : response.data;
  });

  if (portfoliosListQuery.status == 'success')
    return <AfterQueryPrep portfoliosListQuery={portfoliosListQuery} />;
}
