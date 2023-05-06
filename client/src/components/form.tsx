import React from 'react';
import { z } from 'zod';
import Bridge from '../tools/bridge';
import Genid from '../tools/genid';
import FixDate from '../tools/fixDate';
import customFields from './customFields';

import {toast} from 'react-toastify';


// TODO: [BUG] editing the drops downs in the filter header should not effect the form
// TODO: [BUG] remove the hidden fields add the field organization to the form, when you update the on in the header, the hidden field is not updated
// TODO: the select fields in the form should filter the options of the select field dependent on it.

type fieldsT = {
  [key: string]: {
    children?: { id: string; title: string }[];
    label?: string;
    tagName: string;
    props: { [key: string]: string };
  };
};
type hiddenFieldsT = {
  owner_FK: string;
};
type propsT = {
  fields: fieldsT;
  hiddenFields: hiddenFieldsT;
  mode: string;
  style?: 'popup';
  route: string;
  refetch: () => void;
  itemID?: string;
  hideForm: () => void;
};

export default function Form(props: propsT) {
  // console.log(props.fields)

  const fieldsRefs = React.useRef<{
    [key: string]: any;
  }>({}).current;

  const Refs = React.useRef<{ originalValues: { [key: string]: string } }>({
    originalValues: {},
  });
  const refsActions = {
    updateInputValue: (key, value) => {
      if (!Refs.current.originalValues[key]) {
        Refs.current.originalValues[key] = value;
      }
    },
  };

  const parseFields = () => {
    const newData = Object.keys(props.fields).reduce(
      (acc: { [key: string]: string }, fieldKey) => {
        const tagName = props.fields[fieldKey].tagName;
        if (customFields[tagName]) {
          // the prop name of the custom input is different from the actual field name
          // the latter is what is used the identify that value in the server
          acc[fieldKey] = fieldsRefs[tagName];
          return acc;
        }
        acc[fieldKey] = fieldsRefs[fieldKey].value;
        return acc;
      },
      {}
    );
    return newData;
  };
  type formActionT = {
    [key: string]: (e: React.MouseEvent<HTMLElement>) => void;
  };
  const formAction: formActionT = {
    edit: async (e) => {
      e.preventDefault();

      const resp = await Bridge('update', props.route, {
        id: props.itemID,
        owner_FK: props.hiddenFields.owner_FK,
        ...parseFields(),
      });

      if (resp.err) {
        // console.log(resp);
        toast.error(resp)
        toast(resp)
      } else {
        props.refetch();
      }

      if (props.style == 'popup') {
        props.hideForm();
      }
    },
    create: async (e) => {
      e.preventDefault();

      const parsedFields = {
        ...parseFields(),
        owner_FK: props?.hiddenFields?.owner_FK,
      };
      const resp = await Bridge('post', props.route, parsedFields);

      // console.log(resp);
      if (resp.err) {
        // console.log(resp);
        toast.error(resp)
      } else {
        props.refetch();
      }

      if (props.style == 'popup') {
        props.hideForm();
      }
    },
    cancel: (e) => {
      if (e.target != e.currentTarget) return;
      props.hideForm();
    },
  };

  // console.log(customFields)
  // console.log(props)
  const listFields = () => {
    return Object.keys(props.fields).map((fieldKey) => {
      const field = props.fields[fieldKey];

      // console.log(customFields?.[field?.tagName], field?.tagName)
      if (customFields[field?.tagName]) {
        const TagName = customFields[field?.tagName];
        // console.log(fieldsRefs)
        return (
          <label>
            Target Entity:
            <br />
            <TagName
              key={field.props.defaultValue}
              ref={fieldsRefs}
              {...field.props}
            />
          </label>
        );
      }

      // basically adding an hour to the date using string manupulation
      // because JS handles dates poorly
      // console.log(field.props)
      const fieldValue = field.props.defaultValue;
      FixDate(fieldKey, fieldValue, field.props); // mutates the dateFields in the props

      const TagName = field.tagName;
      const randomKey = Genid(10);
      return (
        <label key={fieldKey + randomKey} className={`text-black`}>
          {field.label}:
          {field?.children ? (
            <TagName
              onFocus={(e) => {
                refsActions.updateInputValue(fieldKey, e.target.value);
              }}
              key={fieldKey + randomKey}
              ref={(el) => {
                fieldsRefs[fieldKey] = el;
              }}
              {...field.props}
            >
              {field.children.map((child) => {
                return (
                  <option key={child.id} value={child.id}>
                    {child.title}
                  </option>
                );
              })}
            </TagName>
          ) : (
            <TagName
              onFocus={(e) => {
                refsActions.updateInputValue(fieldKey, e.target.value);
              }}
              key={fieldKey + randomKey}
              ref={(el) => {
                fieldsRefs[fieldKey] = el;
              }}
              {...field.props}
            />
          )}
        </label>
      );
    });
  };

  const sectionProps = {
    'aria-label': 'form',
    className: `grow grid`,
  };
  if (props.style == 'popup') {
    sectionProps.onClick = formAction['cancel'];
    sectionProps.className = `fixed top-0 bottom-0 right-0 left-0
             flex items-center justify-center
             backdrop-blur-md`;
  }

  return (
    <section {...sectionProps}>
      <form
        aria-label={`${props.route} info`}
        className={`mt-[2rem] py-3 px-4 border-gray-300 border-2 rounded-md
                    flex flex-col gap-6`}
      >
        <button className={`ml-auto text-lg`} onClick={formAction.cancel}>
          X
        </button>

        {listFields()}
        <button
          className={`cursor-pointer`}
          onClick={formAction[props.mode]}
          name={props.mode}
        >
          {props.mode}
        </button>
      </form>
    </section>
  );
}
