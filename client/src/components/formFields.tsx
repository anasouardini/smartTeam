import ObjMerge from '../tools/objMerge';

// TODO: abstract certain fields by their category since
// nb: make sure you won't revert this after doing it
// they don't change e.g a task is always going to have
// the same fields all the time
// the empty ones should be abstracted down to one function call
// the others could be a function call with an array

const commonValues = {
  props: {
    type: 'text',
    className: 'border-b-2 border-b-primary px-2 py-1 bg-transparent block text-gray-500',
  },
};

const commonFields = {
  title: {
    tagName: 'input',
    label: 'title',
    props: {
      defaultValue: '',
      type: 'text',
      className: commonValues.props.className,
      placeholder: 'title',
    },
  },
  description: {
    tagName: 'textarea',
    label: 'description',
    props: {
      defaultValue: '',
      type: 'text',
      className: commonValues.props.className,
      placeholder: 'description',
    },
  },
  status: {
    tagName: 'select',
    label: 'status',
    props: {
      defaultValue: '',
      type: 'string',
      className: commonValues.props.className,
    },
  },
};

type fieldsT = { [key: string]: { [key: string]: {} } };
const fields: fieldsT = {
  portfolio: {
    ...commonFields,
    bgImg: {
      label: 'bgImg',
      tagName: 'img',
      props: {
        defaultValue: '',
        className: commonValues.props.className,
        placeholder: 'background image',
      },
    },
  },
  project: {
    ...commonFields,
    dueDate: {
      label: 'due date',
      tagName: 'input',
      props: {
        defaultValue: '',
        type: 'dateuime-local',
        className: commonValues.props.className,
      },
    },
    portfolio_fk: {
      tagName: 'select',
      label: 'portfolio',
      children: [],
      props: {
        defaultValue: '',
        type: 'string',
        className: commonValues.props.className,
      },
    },
    bgColor: {
      tagName: 'input',
      label: 'background color',
      props: {
        defaultValue: '',
        type: 'color',
        className: commonValues.props.className,
        placeholder: 'background color',
      },
    },
    milestone: {
      tagName: 'input',
      label: 'milestone',
      props: {
        defaultValue: '',
        type: 'string',
        className: commonValues.props.className,
        placeholder: 'milestone',
      },
    },
    budget: {
      tagName: 'input',
      label: 'budget',
      props: {
        defaultValue: '',
        type: 'string',
        className: commonValues.props.className,
        placeholder: 'budget',
      },
    },
    expense: {
      label: 'expense',
      tagName: 'input',
      props: {
        defaultValue: '',
        type: 'string',
        className: commonValues.props.className,
        placeholder: 'expense',
      },
    },
  },
  task: {
    ...commonFields,
    portfolio_fk: {
      label: 'portfolio',
      tagName: 'select',
      children: [],
      props: {
        defaultValue: '',
        type: 'string',
        className: commonValues.props.className,
        placeholder: 'portfolio_fk',
      },
    },
    project_fk: {
      label: 'project',
      tagName: 'select',
      children: [],
      props: {
        defaultValue: '',
        type: 'string',
        className: commonValues.props.className,
        placeholder: 'project_fk',
      },
    },
    assignee_fk: {
      label: 'assignee',
      tagName: 'select',
      children: [],
      props: {
        defaultValue: '',
        type: 'string',
        className: commonValues.props.className,
        placeholder: 'assignee_fk',
      },
    },
    bgColor: {
      label: 'background color',
      tagName: 'input',
      props: {
        defaultValue: '',
        type: 'color',
        className: commonValues.props.className,
        placeholder: 'bgColor',
      },
    },
    dueDate: {
      label: 'dueDate',
      tagName: 'input',
      props: {
        defaultValue: '',
        type: 'datetime-local',
        className: commonValues.props.className,
      },
    },
  },
};

const genFields = (
  item: string,
  selectedFields: { [key: string]: string | object }
) => {
  const outputFields = Object.keys(selectedFields).reduce(
    (acc: { [key: string]: any }, fieldKey) => {
      if (!fields[item][fieldKey]) {
        acc[fieldKey] = {
          tagName: 'input',
          props: {
            type: '',
            className: 'border-2 border-red-500',
            defaultValue: `unknown fields key "${fieldKey}"`,
          },
        };
        return acc;
      }

      if (selectedFields[fieldKey] == 'default') {
        acc[fieldKey] = structuredClone(fields[item][fieldKey]);
      } else {
        acc[fieldKey] = {
          ...ObjMerge(fields[item][fieldKey], selectedFields[fieldKey]),
        };
      }

      return acc;
    },
    {}
  );

  // console.log('genfields: ', outputFields)
  return outputFields;
};

export default genFields;
