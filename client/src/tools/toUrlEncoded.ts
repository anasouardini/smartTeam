export default function toUrlEncoded(obj: {
  [key: string]: string | undefined;
}) {
  let params;
  params = Object.keys(obj)
    .reduce<string[]>((acc, key) => {
      const objVal = obj[key]; // for TS
      if (objVal) {
        acc.push(`${encodeURIComponent(key)}=${encodeURIComponent(objVal)}`);
      }
      return acc;
    }, [])
    .join('&');

  return params ? '?' + params : '';
};
