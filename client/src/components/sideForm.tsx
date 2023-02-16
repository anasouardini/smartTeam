import React from 'react';
import { z } from 'zod';
import Bridge from '../tools/bridge';
import Genid from '../tools/genid';

// TODO: [BUG] after editing and refetching, the form should update it's COPY of the item
// TODO: change the style of form.tsx instead of use this one

type propsT = {
  fields: {
    [key: string]: {
      children?: string[][];
      label: string;
      tagName: string;
      props: { [key: string]: string };
    };
  };
  mode: string;
  route: string;
  refetch: () => void;
  itemID?: string;
  hideForm: () => void;
};

export default function Form(props: propsT) {
  // just in case decided I need to change some parent-passed data
  let parentStateRef = React.useRef<{
    fields: {
      [key: string]: {
        tagName: string;
        label: string;
        children?: string[][];
        props: { [key: string]: string };
      };
    };
    mode: string;
  }>({
    fields: {},
    mode: '',
  }).current;

  // reassigning the parent state properties on each render
  parentStateRef = {
    fields: structuredClone(props.fields),
    mode: structuredClone(props.mode),
  };

  const fieldsRefs = React.useRef<{
    [key: string]: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  }>({}).current;

  const parseFields = () => {
    const newData = Object.keys(parentStateRef.fields).reduce(
      (acc: { [key: string]: string }, fieldKey) => {
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
        ...parseFields(),
      });

      if (resp.err) {
        console.log(resp);
      } else {
        props.refetch();
      }

      // props.hideForm();
    },
    create: async (e) => {
      e.preventDefault();

      const resp = await Bridge('post', props.route, {
        ...parseFields(),
      });

      if (resp.err) {
        console.log(resp);
      } else {
        props.refetch();
      }

      // props.hideForm();
    },
    cancel: (e) => {
      if (e.target != e.currentTarget) return;
      props.hideForm();
    },
  };

  // console.log(props.fields)
  const listFields = () => {
    return Object.keys(parentStateRef.fields).map((fieldKey) => {
      const field = parentStateRef.fields[fieldKey];

      // mysql2 misses dates by addin gone hour. hence this mess
      // basically adding an hour to the date using string manupulation
      // because JS handles dates poorly
      if (fieldKey.includes('Date') || fieldKey.includes('date')) {
        const fieldProps = field.props;
        const fieldValue = field.props.defaultValue;
        if (fieldValue) {
          // console.log(fieldValue);
          const hourPlusOne =
            parseInt(fieldValue.split('T')[1].split(':')[0]) + 1;
          const firstPart = fieldValue.slice(0, fieldValue.indexOf('T') + 1);
          const secondPart = fieldValue.slice(fieldValue.indexOf(':'));
          const result = `${firstPart}${`0${hourPlusOne}`.slice(
            -2
          )}${secondPart}`;

          // console.log(hourPlusOne)
          // console.log(result)
          fieldProps.defaultValue = result.split('.')[0];
        }
      }
      // console.log(parentState.fields[fieldKey])
      const TagName = field.tagName;
      const randomKey = Genid(10);
      return (
        <label key={fieldKey + randomKey} className={`text-black`}>
          {' '}
          {field.label}:
          {field?.children ? (
            <TagName
              key={fieldKey + randomKey}
              ref={(el) => {
                fieldsRefs[fieldKey] = el;
              }}
              {...field.props}
            >
              {field?.children ? (
                field.children.map((child) => (
                  <option key={child[0]} value={child[0]}>{child[1]}</option>
                ))
              ) : (
                <></>
              )}
            </TagName>
          ) : (
            <TagName
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

  return (
    <>
      <section
        aria-label='item info'
        className={`grow mt-[2rem] py-3 px-4 border-gray-300 border-2 rounded-md
                    flex flex-col gap-6`}
      >
        <button className={`ml-auto text-lg`} onClick={formAction.cancel}>
          X
        </button>
        {listFields()}
        <button
          className={`cursor-pointer`}
          onClick={formAction[parentStateRef.mode]}
          name={parentStateRef.mode}
        >
          {parentStateRef.mode}
        </button>
      </section>
    </>
  );
}
