import React from 'react';
// import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useOutletContext } from 'react-router-dom';
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
type propsT = { itemsListQuery: queryT };

//TODO: this global state and state actions is better used as a global hook
export default function Projects() {
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

  // the minimal initial ref value is just for the filter header
  const Refs = React.useRef<{
    formFields: {
      [key: string]: { tagName: string; props: { [key: string]: string } };
    };
    formHiddenFields: { owner_FK: string };
    selectInputs: { [key: string]: HTMLSelectElement };
    globalFilter: string;
  }>({
    selectInputs: {},
    FormFields: FormFields('projects'),
    formHiddenFields: { owner_FK: '' },
    globalFilter: loggedInUser.id,
  });

  const itemsListQuery = useQuery('portfolio&connections list', async () => {
    const requestObj = {
      items: {
        portfolios: {
          name: 'portfolios',
          filter: { owner_FK: Refs.current.globalFilter },
        },
        profiles: {
          name: 'connections',
          filter: {},
        },
      },
    };
    const response = await Bridge('post', 'itemsList', requestObj);
    return response?.err == 'serverError' ? false : response.data;
  });
  // if(itemsListQuery.status == 'success'){
  //   console.log(itemsListQuery.data)
  // }

  // TODO: extract this to a seperate component
  const projectsQuery = useQuery(
    'projects',
    async () => {
      const requestObj = {
        portfolio:
          Refs.current.selectInputs.portfolios?.value ??
          itemsListQuery.data.portfolios[0].id,
      };
      // console.log(Refs.current.selectInputs);

      const profile =
        Refs.current.selectInputs?.profiles?.value ||
        itemsListQuery.data?.profiles[0].id;

      if (profile) {
        requestObj.owner_FK = profile;
      }

      const urlEncodedRequestObj = new URLSearchParams(requestObj);
      const response = await Bridge(
        'read',
        `project/all?${urlEncodedRequestObj}`
      );
      return response?.err == 'serverError' ? false : response.data;
    },
    {
      enabled: !!itemsListQuery?.data?.portfolios?.length,
    }
  );
  // if (projectsQuery.status == 'success') {
  //   console.log(projectsQuery.data);
  // }

  // if (!itemsListQuery.data?.portfolios?.length) {
  //   return (
  //     <h1>There are no projects, you have to create a portfolio first.</h1>
  //   );
  // }

  const tailwindClx = {
    projectBorder: 'border-2 border-primary rounded-md',
    projectItem: `flex items-center justify-center w-[12rem]
                  h-[7rem] text-primary text-2xl`,
  };

  const createNewProject = () => {
    Refs.current.formHiddenFields.owner_FK =
      Refs.current.selectInputs.profiles.value;
    Refs.current.formFields = FormFields('project', {
      portfolio: {
        children: itemsListQuery.data.portfolios,
        props: {
          defaultValue: Refs.current.selectInputs.portfolios?.value,
          readOnly: true,
        },
      },
    });

    stateActions.form.show();
  };

  const editProject = (project: { [key: string]: any }) => {
    Refs.current.formHiddenFields.owner_FK =
      Refs.current.selectInputs.profiles.value;
    Refs.current.formFields = FormFields('project', {
      portfolio: {
        children: itemsListQuery.data.portfolios,
        props: {
          defaultValue: Refs.current.selectInputs.portfolios?.value,
          readOnly: true,
        },
      },
      assignee: {
        children: itemsListQuery.data.profiles,
        props: {
          defaultValue: itemsListQuery.data.profiles[0].id,
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

    // console.log(formFieldsRef) 😮
    stateActions.form.show(project.id, 'edit');
  };

  const removeProject = async (project: {[key: string]: any}) => {
    const body = {
      id: project.id,
      portfolio: project.portfolio_FK,
      owner_FK: Refs.current.selectInputs.profiles.value,
    }
    const resp = await Bridge('remove', `project`, body);

    if (!resp.err) {
      projectsQuery.refetch();
    } else {
      console.log(resp);
    }
  };

  let columns = React.useMemo(() => {
    if (projectsQuery.status == 'success') {
      // console.log('query', projectsQuery.data);
      if (projectsQuery.data.length) {
        const cols = Object.keys(projectsQuery.data[0])
          .filter((projectKey) =>
            projectKey != 'id' &&
            projectKey != 'owner_FK' &&
            projectKey != 'assignee_FK' &&
            projectKey != 'creator_FK' &&
            projectKey != 'portfolio_FK' &&
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
              onClick={() => removeProject(project)}
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
  // TODO: this should be in it's own component
  const listHeaderFields = () => {
    const fields = FormFields('project');

    return Object.keys(fields).map((fieldKey) => {
      let TagName = fields[fieldKey].tagName;
      if (TagName == 'textarea') {
        TagName = 'input';
      }
      return <TagName key={fieldKey} {...fields[fieldKey].props} />;
    });
  };

  const listProfiles = () => {
    if (itemsListQuery.status != 'success') {
      return (
        <select>
          <option>empty list</option>
        </select>
      );
    }

    const profiles = itemsListQuery.data.profiles;
    return (
      <>
        <select
          onChange={(e) => {
            Refs.current.globalFilter = e.target.value;
            itemsListQuery.refetch();
            projectsQuery.refetch();
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

  return (
    <div aria-label='container' className={`grow flex flex-col`}>
      <header aria-label='filters' className={`px-6 py-4 flex flex-wrap gap-4`}>
        <select
          ref={(el) => (Refs.current.selectInputs.portfolios = el)}
          onChange={projectsQuery.refetch}
          className={`w-max`}
        >
          {itemsListQuery.status == 'success' &&
            itemsListQuery.data.portfolios.map(
              (portfolio: { id: string; title: string }) => (
                <option value={portfolio.id}>{portfolio.title}</option>
              )
            )}
        </select>
        {listHeaderFields()}
        {listProfiles()}
        <button className={`ml-auto bg-primary text-white rounded-md px-2`}>
          Filter
        </button>
      </header>
      <main
        aria-label='projects'
        className='text-black mt-[7rem] px-10 gap-6 grow flex flex-col items-center'
      >
        <div className={`overflow-auto max-w-min`}>{mountProjectsTable()}</div>

        {/* new project button*/}
        <button
          onClick={createNewProject}
          className={`${tailwindClx.projectBorder} w-max px-3 py-1 text-primary text-lg capitalize`}
        >
          <span className='text-2xl'>+</span> add new project
        </button>

        {state.popup.form.show && Refs.current.formFields != null ? (
          <Form
            hiddenFields={Refs.current.formHiddenFields}
            fields={Refs.current.formFields}
            mode={state.popup.form.mode}
            style='popup'
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
}
