const MPrivileges = require('../models/privileges');

// const getRole = (userID, item) => {
//   switch (userID) {
//     case item.owner_FK:
//       return 'owner';
//     case item.creator_FK:
//       return 'creator';
//     case item.assignee_FK:
//       return 'assignee';
//     default:
//       return '';
//   }
// };

const parentRoute = {
  portfolios: 'profile',
  projects: 'portfolios',
  tasks: 'projects',
};

const checkAceess = async ({ route, itemID, action, columnsNames }) => {
  let isValid = false;
  const parentPrivsResp = await MPrivileges.check({ route, itemID });
  if (parentPrivsResp.err) {
    return { err: true, data: 'err while fetching privileges' };
  }

  // console.log(parentPrivsResp[0])
  if (!parentPrivsResp[0].length) {
    return { isValid };
  }

  const privilegesObj = parentPrivsResp[0][0].privilege;
  console.log(privilegesObj)

  if (action === 'update') {
    isValid = privilegesObj.currentItem.update.all;
    if (!isValid) {
      isValid = columnsNames.every(
        (columnName) => privilegesObj.currentItem.update?.[columnName]
      );
    }
    return { isValid };
  }

  isValid = privilegesObj.currentItem?.[action];
  return { isValid };
};

const check = async ({ entityName, action, userID, item }) => {
  const result = { err: false, valid: false, data: [] };

  switch (action) {
    case 'readSingle': {
      if (item.owner_FK === userID) {
        result.valid = true;
        break;
      }
      const parentPrivsResp = await MPrivileges.check({route: entityName, itemID: item.id});
      if (parentPrivsResp.err) {
        result.err = true;
        result.data = 'err while fetching privileges';
        break;
      }
      if (parentPrivsResp[0].length) {
        result.valid = true;
      }
      break;
    }
    case 'readAll': {
      result.valid = true;
      if(!item.length){break;}

      // console.log(item)
      // TODO: filtering by table/entity name, will remove the extra rows
      const parentPrivsResp = await MPrivileges.read({owner_FK: item[0].owner_FK});
      if (parentPrivsResp.err) {
        result.err = true;
        result.data = 'err while fetching privileges';
        break;
      }

      // items is an array, despite the singular name
      item.forEach((item) => {
        if (item.owner_FK === userID) {
          result.data.push(item);
          return; // continue to the next
        }

        // console.log(parentPrivsResp[0])
        if (parentPrivsResp[0].length) {
          parentPrivsResp[0].forEach((priv) => {
            const tableName = entityName.slice(0, -1) + '_FK';
            // console.log(tableName);
            if (priv[tableName] === item.id) {
              result.data.push(item);
            }
          });
        }
      });
      break;
    }
    case 'create': {
      if (entityName === 'portfolios') {
        const isOwner = userID == item.owner_FK;
        if (!isOwner) {
          result.data = 'portfolios can only be created by the account owner.';
        }

        result.valid = isOwner;
        break;
      }

      const accessResult = await checkAceess({
        route: parentRoute[entityName],
        itemID: item.parentID,
        action: 'create',
      });
      if (accessResult.err) {
        result.err = accessResult.err;
        result.data = accessResult.data;
        break;
      }
      if (accessResult.isValid) {
        result.valid = true;
      }

      break;
    }
    case 'update': {

      if (item.owner_FK === userID) {
        result.valid = true;
        break;
      }
      const accessResult = await checkAceess({
        route: entityName,
        itemID: item.id,
        action: 'update',
        columnsNames: item.columnsNames,
      });
      if (accessResult.err) {
        result.err = accessResult.err;
        result.data = accessResult.data;
        break;
      }
      if (accessResult.isValid) {
        result.valid = true;
      }

      break;
    }
    case 'remove': {

      if (item.owner_FK === userID) {
        result.valid = true;
        break;
      }

      // console.log(entityName)
      const accessResult = await checkAceess({
        route: entityName,
        itemID: item.id,
        action: 'remove',
      });

      if (accessResult.err) {
        result.err = accessResult.err;
        result.data = accessResult.data;
        break;
      }
      if (accessResult.isValid) {
        result.valid = true;
      }

      break;
    }
    case 'assign': {
      const accessResult = await checkAceess({
        route: entityName,
        itemID: item.id,
        action: 'assign',
      });

      if (accessResult.err) {
        result.err = accessResult.err;
        result.data = accessResult.data;
      }
      if (accessResult.isValid) {
        result.valid = true;
      }

      break;
    }
    default:
      result.err = true;
      result.data = 'not such action';
  }

  return result;
};

module.exports = { check };
