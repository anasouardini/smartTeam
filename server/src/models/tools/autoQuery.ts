const create = (table:string, newData:{[key:string]: any}):{query: string, vars: any[]}=>{
  let query = `insert into ${table}(`;
  let vars:any[] = [];

  let tmpQueryCols = '';
  Object.entries(newData).forEach((item) => {
    tmpQueryCols += `, ${item[0]}`;
  });
  // delete the first comma and space then close the list
  query += tmpQueryCols.slice(2) + ') values(';

  let tmpQueryValues = '';
  Object.entries(newData).forEach((item) => {
    tmpQueryValues += `, ?`;
    vars.push(item[1]);
  });
  // delete the first comma and space then close the list
  query += tmpQueryValues.slice(2) + ')';
  // console.log(query)

  return {query, vars}
}

const read = (table:string, filter:{[key:string]: any}, fields:string[]):{query: string, vars: any[]}=>{
  let query = `select ${fields ? fields.join(', ') : '*'} from ${table}`;
  // console.log(query)
  let vars:any[] = [];

  if(filter){
    query += ' where 1=1';
    Object.entries(filter).forEach((item) => {
      query += ` and ${item[0]}=?`;
      vars.push(item[1]);
    });
  }

  return {query, vars}
}

const remove = (table:string, filter:{[key:string]: any}):{query: string, vars: any[]}=>{
  let query = `delete from ${table}`;
  let vars:any[] = [];

  query += ' where 1=1';
  if(filter){
    Object.entries(filter).forEach((item) => {
      query += ` and ${item[0]}=?`;
      vars.push(item[1]);
    });
  }

  return {query, vars}
}

const update = (table:string, filter:{[key:string]: any}, newData:{[key:string]: any}):{query: string, vars: any[]}=>{

  let query = `update ${table} set`;
  let vars:any[] = [];

  let tmpQuery = '';
  Object.entries(newData).forEach((item) => {
    tmpQuery += `, ${item[0]}=?`;
    vars.push(item[1]);
  });
  query += tmpQuery.slice(1);// delete the first comma

  query += ' where 1=1';
  if(filter){
    Object.entries(filter).forEach((item) => {
      query += ` and ${item[0]}=?`;
      vars.push(item[1]);
    });
  }

  return {query, vars}
}

module.exports = {read, update, remove, create};
