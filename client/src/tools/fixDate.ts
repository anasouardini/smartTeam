export default function fixDate(fieldName: string, fieldValue: string, fieldProps: {[key:string]:string}) {
  if (fieldName.includes('Date') || fieldName.includes('date')) {
    if (fieldValue) {
      // console.log(fieldValue);
      const hourPlusOne = parseInt(fieldValue.split('T')[1].split(':')[0]) + 1;
      const firstPart = fieldValue.slice(0, fieldValue.indexOf('T') + 1);
      const secondPart = fieldValue.slice(fieldValue.indexOf(':'));
      const result = `${firstPart}${`0${hourPlusOne}`.slice(-2)}${secondPart}`;

      // console.log(hourPlusOne)
      // console.log(result)
      fieldProps.defaultValue = result.split('.')[0];
    }
  }
  // console.log(parentState.fields[fieldKey])
  return;
}
