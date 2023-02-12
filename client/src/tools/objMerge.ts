const merger = (obj:{[key:string]:any}, newObj:{[key:string]:any}) => {
    Object.keys(newObj).forEach((key) => {
        //* OR NULL because JS is a shitty lang
        if (typeof newObj[key] != 'object' || newObj[key] == null) {
            obj[key] = newObj[key];
        } else {
            if (!obj.hasOwnProperty(key) || typeof obj[key] != typeof newObj[key]) {
                obj[key] = newObj[key];
            }
            merger(obj[key], newObj[key]);
        }
    });
};

const objMerge = (obj:{}, newObj:{}) => {
    const stateRef = structuredClone(obj);

    merger(stateRef, newObj);
    return stateRef;
};

export default objMerge
