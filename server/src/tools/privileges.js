const MPrivileges = require('../models/privileges');

// route=table
// action
// items(if the action=='read/readAll')
// itemID(if action != 'read/readAll')
// req

//

const getRole = (userID, item) => {
  switch (userID) {
    case item.owner_FK:
      return 'owner';
    case item.creator_FK:
      return 'creator';
    case item.assignee_FK:
      return 'assignee';
    default:
      return '';
  }
};

const checkAceess = async ({ route, itemID, action, columnName }) => {
  const parentPrivsResp = await MPrivileges.check(route, itemID);
  if (parentPrivsResp.err) {
    return { err: true, data: 'err while fetching privileges' };
  }

  const privilegesObj = JSON.parse(parentPrivsResp[0][0].privilege);

  let isValid;
  if (action === 'update') {
    isValid =
      privilegesObj.childrenItems.update.all ||
      privilegesObj.childrenItems.update?.[columnName] ||
      false;
  } else {
    isValid = privilegesObj.childrenItems?.[action];
  }

  return { isValid };
};

const check = async ({ route, action, userID, item }) => {
  const result = { err: false, valid: false, data: [] };

  // TODO: read and read all need to check aprivileges
  switch (action) {
    case 'readSingle': {
      if (getRole(userID, item)) {
        result.valid = true;
      }
      break;
    }
    case 'readAll': {
      result.valid = true;
      // items is an array, despite the singular name
      item.forEach((item) => {
        if (getRole(userID, item)) {
          result.data.push(item);
        }
      });
      break;
    }
    case 'create': {
      if (route === 'portfolios') {
        // needs the organizations feature to be implemented
        // the origanization that the portfolio is going to be created at,
        // is the only one that should be able to do it

        break;
      }

      const accessResult = await checkAceess({
        route: item.parentRoute,
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
      const accessResult = await checkAceess({
        route,
        itemID: item.id,
        action: 'update',
        columnName: item.columnName,
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
      const accessResult = await checkAceess({
        route,
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
        route,
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
