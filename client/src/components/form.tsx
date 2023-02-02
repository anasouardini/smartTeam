import React from 'react';
import { z } from 'zod';
import Bridge from '../tools/bridge';

type propsT = {
  fields: {
    [key: string]: {
      value: string;
      tagName: string;
      props: {[key:string]:string};
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
  const [parentState, _] = React.useState({
    fields: props.fields,
    mode: props.mode,
  });

  const fieldsRefs = React.useRef<{
    [key: string]: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  }>({}).current;

  const parseFields = () => {
    const newData = Object.keys(parentState.fields).reduce(
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
      }else{
        props.refetch();
      }

      props.hideForm();
    },
    create: async (e) => {
      e.preventDefault();

      const resp = await Bridge('post', props.route, {
        ...parseFields(),
      });

      if (resp.err) {
        console.log(resp);
      }else{
        props.refetch();
      }

      props.hideForm();
    },
    cancel: (e) => {
      if (e.target != e.currentTarget) return;
      props.hideForm();
    },
  };

// console.log(props.fields)
  const listFields = () => {
    return Object.keys(parentState.fields).map((fieldKey) => {
      const field = parentState.fields[fieldKey];
      // console.log(parentState.fields[fieldKey])
      const TagName = field.tagName;
      return (
        <TagName
          key={fieldKey}
          ref={(el) => {
            fieldsRefs[fieldKey] = el;
          }}
          {...field.props}
        />
      );
    });
  };

  return (
    <>
      <div
        aria-label='overlay'
        onClick={formAction['cancel']}
        className={`fixed top-0 bottom-0 right-0 left-0
             flex items-center justify-center
             backdrop-blur-md`}
      >
        <form className='flex flex-col gap-4 border-primary border-2 rounded-md p-5'>
          {listFields()}
          <button
            className={`cursor-pointer`}
            onClick={formAction[parentState.mode]}
            name={parentState.mode}
          >
            {parentState.mode}
          </button>
        </form>
      </div>
    </>
  );
}
