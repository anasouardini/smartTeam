import React from 'react';
import { z } from 'zod';

type propsT = {
  fields: {
    [key: string]: {
      value: string;
      tagName: string;
      type: string;
    };
  };
  mode: string;
  refetch: () => void;
  cancel: () => void;
};

export default function Form(props: propsT) {
  // just in case decided I need to change some parent-passed data
  const [parentState, setParentState] = React.useState({
    fields: props.fields,
    mode: props.mode,
    cancel: props.cancel,
  });

  const fieldsRefs = React.useRef<{ [key: string]: string }>({}).current;

  type formActionT = {
    [key: string]: (e: React.MouseEvent<HTMLElement>) => void;
  };
  const formAction: formActionT = {
    edit: (e) => {
      e.preventDefault();
    },
    create: (e) => {
      e.preventDefault();
    },
    cancel: (e) => {
      if (e.target != e.currentTarget) return;
      parentState.cancel();
    },
  };

  const listFields = () => {
    return Object.keys(parentState.fields).map((fieldKey) => {
      const field = parentState.fields[fieldKey];
      const TagName = field.tagName;
      return (
        <TagName
          ref={(el) => {
            fieldsRefs[fieldKey] = el;
          }}
          type={field.type}
          value={field.value}
          className='border-b-2 border-b-primary px-2 py-1'
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
             backdrop-blur-sm`}
      >
        <form className='flex flex-col gap-4 border-primary border-2 rounded-md p-5'>
          {listFields()}
          <button
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
