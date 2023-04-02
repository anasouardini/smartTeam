const Pool = require('./dbPool');
const AutoQuery = require('./tools/autoQuery');
const { v4: uuid } = require('uuid');

const create = async (users) => {
  const autoQuery = AutoQuery.create('connections', {
    userA: users.inviter,
    userB: users.newConnection,
  });
  const response = await Pool(autoQuery.query, autoQuery.vars);

  // console.log(response[0]);
  return response;
};

const read = async ({ userID }) => {
  const query = `select cnx.*, A.username as usernameA, B.username as usernameB
                from connections cnx
                inner join users A on cnx.userA=A.id
                inner join users B on cnx.userB=B.id
                where cnx.userA=? or cnx.userB=?
              ;`;
  const response = await Pool(query, [userID, userID]);

  const modifiedResp = response[0].map((connection) => {
    return connection.userA != userID
      ? {
          id: connection.userA,
          username: connection.usernameA,
        }
      : {
          id: connection.userB,
          username: connection.usernameB,
        };
  });

  // the outer array is simulating the array returned by the 
  return [modifiedResp];
};

module.exports = { create, read, list: read };
