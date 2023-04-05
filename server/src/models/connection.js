const Pool = require('./dbPool');
const AutoQuery = require('./tools/autoQuery');
const { v4: uuid } = require('uuid');

const create = async (users) => {
  const autoQuery = AutoQuery.create('connections', {
    userA_FK: users.inviter,
    userB_FK: users.newConnection,
  });
  const response = await Pool(autoQuery.query, autoQuery.vars);

  // console.log(response[0]);
  return response;
};

const read = async ({ userID }) => {
  const query = `select cnx.*, A.username as usernameA, B.username as usernameB
                from connections cnx
                inner join users A on cnx.userA_FK=A.id
                inner join users B on cnx.userB_FK=B.id
                where cnx.userA_FK=? or cnx.userB_FK=?
              ;`;
  const response = await Pool(query, [userID, userID]);
  if(response.err){
    return {err: 'error while reading connections'}
  }

  const modifiedResp = response[0].map((connection) => {
    return connection.userA_FK != userID
      ? {
          id: connection.userA_FK,
          username: connection.usernameA,
        }
      : {
          id: connection.userB_FK,
          username: connection.usernameB,
        };
  });

  // the outer array is simulating the array returned by the 
  return [modifiedResp];
};

module.exports = { create, read, list: read };
