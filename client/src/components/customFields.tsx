import React from 'react';

const ListInput = (props, ref) => {
  const tailwindClx = {
    commonBorder: `border-2 border-primary rounded-md px-1 py-1`,
  };

  const targetEntityKey = 'targetEntity';

  return (
    <>
      <input
        list='props.itemsList'
        placeholder={targetEntityKey}
        onChange={(e) => {
          const selectedValue = e.target.value;
          const listID = e.target.getAttribute('list');
          ref.current = {
            type: selectedValue.split(' - ')[0],
            value:
              document.querySelector(
                `#${listID} option[value='${selectedValue}']`
              )?.dataset?.value || '%',
          };
        }}
        className={tailwindClx.commonBorder}
        name={targetEntityKey}
      />
      <datalist id='props.itemsList'>
        {Object.keys(props.itemsList).map((entityKey: string) => {
          return props.itemsList[entityKey].map(
            (entityOption: { [key: string]: string }) => {
              const entityOptionValues = Object.values(entityOption);
              // console.log(entityOptionValues);
              return (
                <option
                  key={entityOptionValues[0]}
                  value={`${entityKey} - ${entityOptionValues[1]}`}
                  data-value={entityOptionValues[0]}
                />
              );
            }
          );
        })}
      </datalist>
    </>
  );
};

export default {ListInput: React.forwardRef(ListInput)};

