const create = (table, newData)=>{
  let query = `insert into ${table}(`;
  let vars = [];

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

const read = (table, filter, fields)=>{
  let query = `select ${fields ? fields.join(' ') : '*'} from ${table}`;
  let vars = [];

  query += ' where 1=1';
  if(filter){
    Object.entries(filter).forEach((item) => {
      query += ` and ${item[0]}=?`;
      vars.push(item[1]);
    });
  }

  return {query, vars}
}

const remove = (table, filter)=>{
  let query = `delete from ${table}`;
  let vars = [];

  query += ' where 1=1';
  if(filter){
    Object.entries(filter).forEach((item) => {
      query += ` and ${item[0]}=?`;
      vars.push(item[1]);
    });
  }

  return {query, vars}
}

const update = (table, filter, newData)=>{

  let query = `update ${table} set`;
  let vars = [];

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
