import React from 'react';
import Bridge from '../tools/bridge';
import { FaPen, FaTrash } from 'react-icons/fa';
import Form from './form';
import FormFields from '../components/formFields';

export default function Project(props: { refetch: () => void; row: any }) {
  const [state, setState] = React.useState({
    // just in case decided I need to change some parent-passed data
    popup: { form: { show: false, mode: 'edit' } },
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

  const fields = FormFields('project', {
    title: 'default',
    description: 'default',
    bgColor: 'default',
    dueDate: 'default',
    status: 'default',
    milestone: 'default',
    budget: 'default',
    expense: 'default',
  })

  return (
    <>
      <tr
        {...props.row.getRowProps()}
        className={`border(2,primary) rounded-md px-3 py-1`}
      >
        {props.row.cells.map((cell) => (
          <td {...cell.getCellProps()} className={`px-4 py-3`}>
            {cell.render('Cell')}
          </td>
        ))}
      </tr>
      {/*state.popup.form.show ? (
        <Form
          mode={state.popup.form.mode}
          refetch={props.refetch}
          itemID={state.item.id}
          hideForm={stateActions.form.hide}
        />
      ) : (
        <></>
      )*/}
    </>
  );
}
