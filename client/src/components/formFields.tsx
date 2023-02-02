import ObjMerge from '../tools/objMerge';

const commonValues = {
  props: { type: 'text', className: 'border-b-2 border-b-primary px-2 py-1 bg-transparent' },
};

const commonFields = {
  title: {
    tagName: 'input',
    props: {
      defaultValue: '',
      type: 'text',
      className: commonValues.props.className,
      placeholder: 'title',
    },
  },
  description: {
    tagName: 'textarea',
    props: {
      defaultValue: '',
      type: 'text',
      className: commonValues.props.className,
      placeholder: 'description',
    },
  },
};

type fieldsT = { [key: string]: { [key: string]: {} } };
const fields: fieldsT = {
  portfolio: {
    ...commonFields,
    status: {
      tagName: 'input',
      props: {
        defaultValue: '',
        type: 'text',
        className: commonValues.props.className,
      },
    },
    bgImg: {
      tagName: 'input',
      props: {
        defaultValue: '',
        type: 'text',
        className: commonValues.props.className,
        placeholder: 'background image',
      },
    },
  },
  project: {
    ...commonFields,
    dueDate: {
      tagName: 'input',
      props: {
        defaultValue: '',
        type: 'date',
        className: commonValues.props.className,
        placeholder: 'due date',
      },
    },
    portfolio_fk: {
      tagName: 'input',
      props: {
        defaultValue: '',
        type: 'string',
        className: commonValues.props.className,
      },
    },
    bgColor: {
      tagName: 'input',
      props: {
        defaultValue: '',
        type: 'string',
        className: commonValues.props.className,
        placeholder: 'background color',
      },
    },
    status: {
      tagName: 'select',
      props: {
        defaultValue: '',
        type: 'string',
        className: commonValues.props.className,
      },
    },
    milestone: {
      tagName: 'input',
      props: {
        defaultValue: '',
        type: 'string',
        className: commonValues.props.className,
        placeholder: 'milestone',
      },
    },
    budget: {
      tagName: 'input',
      props: {
        defaultValue: '',
        type: 'string',
        className: commonValues.props.className,
        placeholder: 'budget',
      },
    },
    expense: {
      tagName: 'input',
      props: {
        defaultValue: '',
        type: 'string',
        className: commonValues.props.className,
        placeholder: 'expense',
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
          props: { type: '', className: 'border-2 border-red-500', defaultValue: `unknown fields key "${fieldKey}"`},
        };
        return acc;
      }

      if (selectedFields[fieldKey] == 'default') {
        acc[fieldKey] = fields[item][fieldKey];
      } else {
        acc[fieldKey] = {
          ...ObjMerge(
            fields[item][fieldKey],selectedFields[fieldKey],
          )
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
