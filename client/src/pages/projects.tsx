import React from 'react';
// import { useParams } from 'react-router-dom';
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
type propsT = { portfoliosListQuery: queryT };

const AfterQueryPrep = (props: propsT) => {
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
  // the minimal initial ref value is just for the filter header
  const formFieldsRef = React.useRef<{
    [key: string]: { tagName: string; props: { [key: string]: string } };
  }>(FormFields('project', {
      title: 'default',
      dueDate: 'default',
      status: 'default',
      milestone: 'default',
      budget: 'default',
      expense: 'default',
    }));

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

  const createNewProject = () => {
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

  const editProject = (project: { [key: string]: any }) => {
    formFieldsRef.current = FormFields('project', {
      portfolio_fk: {
        props: {
          defaultValue: portfolio_fkSelectRef.current?.value,
          readOnly: true,
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

  const removeProject = async (id: string) => {
    const resp = await Bridge('remove', `project`, {
      id,
    });

    if (resp.err) {
      console.log(resp);
      return;
    }

    projectsQuery.refetch();
  };

  let columns = React.useMemo(() => {
    if (projectsQuery.status == 'success') {
      // console.log('query', projectsQuery.data);
      if (projectsQuery.data.length) {
        const cols = Object.keys(projectsQuery.data[0])
          .filter((projectKey) =>
            projectKey != 'id' &&
            projectKey != 'portfolio_fk' &&
            projectKey != 'ownerID'
              ? true
              : false
          )
          .map((projectKey) => ({
            Header: projectKey,
            accessor: projectKey,
          }));

        return [
          ...cols,
          { Header: 'edit', accessor: 'edit' },
          { Header: 'delete', accessor: 'delete' },
        ];
      }
      return [{ Header: 'no data to list', accessor: 'key' }];
    }

    return [{ Header: 'prending...', accessor: 'key' }];
  }, [projectsQuery.status, projectsQuery.dataUpdatedAt]);

  let data = React.useMemo(() => {
    if (projectsQuery.status == 'success') {
      const dt = projectsQuery.data.map((project: { [key: string]: any }) => {
        const newProject = { ...project };

        // no reason to delete these
        // delete newProject.id;
        // delete newProject.ownerID;
        // delete newProject.portfolio_fk;

        newProject.edit = (
          <button>
            <FaPen
              className='text-primary mx-auto'
              onClick={() => editProject(project)}
            />
          </button>
        );
        newProject.delete = (
          <button>
            <FaTrash
              className='text-primary mx-auto'
              onClick={() => removeProject(project.id)}
            />
          </button>
        );

        newProject.createDate = new Date(newProject.createDate).toDateString();
        return newProject;
      });

      return dt;
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
              <tr
                {...row.getRowProps()}
                className={`border(2,primary) bg-gray-300/90`}
              >
                {row.cells.map((cell) => (
                  <td
                    {...cell.getCellProps()}
                    className={`px-4 py-3 text-center`}
                  >
                    {cell.render('Cell')}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  // TODO: set default selected item to the last visited one

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
  return (
    <div aria-label='container' className={`grow flex flex-col`}>
      <header aria-label='filters' className={`px-6 py-4 flex flex-wrap gap-4`}>
        <select
          ref={portfolio_fkSelectRef}
          onChange={projectsQuery.refetch}
          className={`w-max`}
        >
          {props.portfoliosListQuery.data.map(
            (portfolio: { id: string; title: string }) => (
              <option value={portfolio.id}>{portfolio.title}</option>
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
        className='text-black mt-[7rem] px-10 gap-6 grow flex flex-col items-center'
      >

        {mountProjectsTable()}

        {/* new project button*/}
        <button
          onClick={createNewProject}
          className={`${tailwindClx.projectBorder} w-max px-3 py-1 text-primary text-lg capitalize`}
        >
          <span className='text-2xl'>+</span> add new project
        </button>

        {state.popup.form.show && formFieldsRef.current != null ? (
          <Form
            fields={formFieldsRef.current}
            mode={state.popup.form.mode}
            itemID={state.popup.form.itemID}
            route={'project'}
            refetch={projectsQuery.refetch}
            hideForm={stateActions.form.hide}
          />
        ) : (
          <></>
        )}
      </main>
    </div>
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

  return <></>;
}
