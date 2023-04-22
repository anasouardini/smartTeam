import React from 'react';

const ListInput = (props, ref) => {
  const tailwindClx = {
    commonBorder: `border-2 border-primary rounded-md px-1 py-1`,
  };
  const targetEntityKey = 'targetEntity';

  const inputRefs = React.useRef({targetEntity: null});


  const setExternalRef = (e)=>{
    const selectedValue = inputRefs.current.targetEntity.value;
    const listID = inputRefs.current.targetEntity.getAttribute('list');
    // console.log('changing custom ref')
    if (selectedValue) {
      // console.log(`#${listID} option[value='${selectedValue}']`)
      ref['ListInput'] = {
        type: selectedValue.split(' - ')[0].slice(0, -1) + '_FK',
        value:
          document.querySelector(
            `#${listID} option[value='${selectedValue}']`
          )?.dataset?.value || null,
      };
    }
  }

  // the ref has to be set at the rendering phase
  // when the input is not edited, the form will send undefined to the server
  React.useEffect(()=>{
    setExternalRef();
  }, [])

  return (
    <>
      <input
        ref={(el)=>{inputRefs.current.targetEntity = el}}
        list='itemsList'
        placeholder={
          Object.keys(props.itemsList).length
            ? targetEntityKey
            : 'List is empty'
        }
        onChange={setExternalRef}
        className={tailwindClx.commonBorder}
        name={targetEntityKey}
        defaultValue={props.defaultValue}
        autoComplete='off'
      />
      <datalist id='itemsList'>
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

export default { ListInput: React.forwardRef(ListInput) };
