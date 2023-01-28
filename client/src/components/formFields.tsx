const commonValues = {
  props: { type: 'text', className: 'border-b-2 border-b-primary px-2 py-1' },
};

const commonFields = {
  title: {
    value: '',
    tagName: 'input',
    props: { type: 'text', className: commonValues.props.className },
  },
  description: {
    value: '',
    tagName: 'textarea',
    props: { type: 'text', className: commonValues.props.className },
  },
};

type fieldsT = { [key: string]: { [key: string]: {} } };
const fields: fieldsT = {
  portfolio: {
    ...commonFields,
    status: {
      value: '',
      tagName: 'input',
      props: { type: 'text', className: commonValues.props.className },
    },
    bgImg: {
      value: '',
      tagName: 'input',
      props: { type: 'text', className: commonValues.props.className },
    },
  },
  project: {
    ...commonFields,
    dueDate: {
      value: '',
      tagName: 'input',
      props: { type: 'date', className: commonValues.props.className },
    },
    portfolioID: {
      value: '',
      tagName: 'input',
      props: {
        type: 'string',
        className: commonValues.props.className,
      },
    },
    bgColor: {
      value: '',
      tagName: 'input',
      props: {
        type: 'string',
        className: commonValues.props.className,
      },
    },
    status: {
      value: '',
      tagName: 'select',
      props: {
        type: 'string',
        className: commonValues.props.className,
      },
    },
    milestone: {
      value: '',
      tagName: 'input',
      props: {
        type: 'string',
        className: commonValues.props.className,
      },
    },
    budget: {
      value: '',
      tagName: 'input',
      props: {
        type: 'string',
        className: commonValues.props.className,
      },
    },
    expense: {
      value: '',
      tagName: 'input',
      props: {
        type: 'string',
        className: commonValues.props.className,
      },
    },
  },
};

const genFields = (
  item: string,
  selectedFields: { [key: string]: string | object }
) => {
  const outputFields =  Object.keys(selectedFields).reduce(
    (acc: { [key: string]: any }, fieldKey) => {
      if (!fields[fieldKey]) {
        acc[fieldKey] = { value: 'unknown fields key', tagName: 'p' };
      }

      if (selectedFields[fieldKey] == 'default') {
        acc[fieldKey] = fields[item][fieldKey];
      } else {
        acc[fieldKey] = {
          ...fields[item][fieldKey],
          ...(selectedFields[fieldKey] as object), // TS is not that clever
        };
      }

      return acc;
    },
    {}
  );

  // console.log('genfields: ', outputFields)
  return outputFields
};

export default genFields;
