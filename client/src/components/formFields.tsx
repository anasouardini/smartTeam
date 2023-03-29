import ObjMerge from '../tools/objMerge';

// This entire idea was a failure, it would've been better to stick to my favorit
// custom fields and passing objects directly to the form

const commonValues = {
  props: {
    className:
      'border-b-2 border-b-primary px-2 py-1 bg-transparent block text-gray-500',
  },
};

const selectFields = {
  portfolio: {
    tagName: 'select',
    label: 'portfolio',
    children: [],
    props: {
      defaultValue: '',
      className: commonValues.props.className,
    },
  },
  project: {
    tagName: 'select',
    label: 'project',
    children: [],
    props: {
      defaultValue: '',
      className: commonValues.props.className,
    },
  },
  task: {
    tagName: 'select',
    label: 'task',
    children: [],
    props: {
      defaultValue: '',
      className: commonValues.props.className,
    },
  },
  privilegesCategories: {
    tagName: 'select',
    label: 'privileges Category',
    children: [],
    props: {
      defaultValue: '',
      className: commonValues.props.className,
    },
  },
  user: {
    tagName: 'select',
    label: 'user',
    children: [],
    props: {
      defaultValue: '',
      className: commonValues.props.className,
    },
  },
  assignee: {
    label: 'assignee',
    tagName: 'select',
    children: [],
    props: {
      defaultValue: '',
      className: commonValues.props.className,
      placeholder: 'assignee',
    },
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
    portfolio: selectFields.portfolio,
    ...commonFields,
    dueDate: {
      label: 'duedate',
      tagName: 'input',
      props: {
        defaultValue: '',
        type: 'datetime-local',
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
    portfolio: selectFields.portfolio,
    project: selectFields.project,
    assignee: selectFields.assignee,
    ...commonFields,
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
  privileges: {
    user: {
      label: 'user',
      tagName: 'select',
      children: [],
      props: {
        defaultValue: '',
        className: commonValues.props.className,
        placeholder: 'user',
      },
    },
    targetEntity: {},
    privilegesCategories: selectFields.privilegesCategories,
  },
};

const genFields = (
  item: string,
  selectedFields: { [key: string]: string | object } = {}
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
  return { ...fields[item], ...outputFields };
};

export default genFields;
