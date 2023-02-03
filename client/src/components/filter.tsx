type propsT = {
  fields: {
    [key: string]: { tagName: string; props: { [key: string]: string } };
  };
};
export default function Filter(props: propsT) {
  // console.log(props.fields)

  const listFields = () => {
    return Object.keys(props.fields).map((fieldKey) => {
      let TagName = props.fields[fieldKey].tagName;
      if (TagName == 'textarea') {
        TagName = 'input';
      }
      return <TagName {...props.fields[fieldKey].props} />;
    });
  };

// TODO: only show few important fields by defautl
// TODO: with the ability to expand the others
  return (
    <>
      <header aria-label='filters' className={`px-6 py-4 flex flex-wrap gap-4`}>
        {listFields()}
        <button className={`ml-auto bg-primary text-white rounded-md px-2`}>
          Filter
        </button>
      </header>
    </>
  );
}
