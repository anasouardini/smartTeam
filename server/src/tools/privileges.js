const Models = {
  MPrivileges: require('../models/privileges'),
  MPortfolios: require('../models/portfolio'),
  MProjects: require('../models/project'),
};

const parentRoute = {
  portfolios: 'profile',
  projects: 'portfolios',
  tasks: 'projects',
};

const checkAccess = async ({
  userID,
  tableName,
  items,
  action,
  columnsNames,
  checkParents,
}) => {
  const resultTemplate = {
    err: false,
    errMessage: '',
    isValid: false,
    item: {},
  };
  const results = [];

  for (let i = 0; i < items.length; i++) {
    let itemResp;
    if (checkParents) {
      itemResp = await Models[tableName].read({
        id: items[i].id,
        owner_FK: items[i].owner_FK,
      });
      if (itemResp.err) {
        return {
          err: true,
          data: 'err while fetching privileges in checkAceess -- syntax error in privileges/check',
        };
      }
      if (itemResp[0].length) {
        return {
          err: true,
          data: 'err while fetching item in checkAceess -- no item was found',
        };
      }
    }

    // check if the user is the owner
    if (items[i].owner_FK == userID) {
      results[i] = { ...resultTemplate, isValid: true, item: items[i] };
    }

    // fetching privileges
    const parentPrivsResp = await Models.MPrivileges.check({
      route: tableName,
      itemID: checkParents ? itemResp[0][0].id : items[0].id,
    });
    if (parentPrivsResp.err) {
      results[i] = {
        ...resultTemplate,
        err: true,
        errMessage: 'err while fetching privileges',
      };
    }

    // check parent if there are no privileges for the current item
    if (!parentPrivsResp[0].length) {
      const parentRoute = parentRoute?.[tableName.slice(0, -1) + '_FK'];
      if (parentRoute && parentRoute != 'profile') {
        const parentID = itemResp[0][0][parentRoute];
        return checkAccess({
          userID,
          tableName: parentRoute,
          items: [items[i]],
          action,
          checkParents: true,
        });
      }
      results[i] = { ...resultTemplate };
    }

    // read is implicitly indicated by the existance of a row in privileges table
    if (action === 'read') {
      results[i] = { ...resultTemplate, isValid: true, item: items[i] };
    }

    // check if has privileges for the provided action
    const privSection = checkParents ? 'childrenItems' : 'currentItem';
    const privilegesObj = parentPrivsResp[0][0].privilege;
    // console.log(privilegesObj)

    if (action === 'update') {
      isValid = privilegesObj[privSection].update.all;
      if (!isValid && !checkParents) {
        isValid = columnsNames.every(
          (columnName) => privilegesObj[privSection].update?.[columnName]
        );
      }
      results[i] = { ...resultTemplate };
    }

    results[i] = {
      ...resultTemplate,
      isValid: privilegesObj[privSection]?.[action],
    };
  }

  return results;
};

const check = async ({ tableName, action, userID, items, columnsNames }) => {
  const result = { err: false, valid: false, data: [] };

  switch (action) {
    case 'readSingle': {
      const accessResult = await checkAccess({
        userID,
        tableName,
        items,
        action,
        columnsNames,
      });

      if (accessResult[0].isValid) {
        result.valid = accessResult[0].isValid;
        result.data = items;
      }
      break;
    }
    case 'readAll': {
      result.valid = true;
      if (!items.length) {
        break;
      }

      const privsResp = checkAccess({
        userID,
        tableName,
        items: items,
        action,
      });

      // items is an array, despite the singular name
      items.forEach((item, index) => {
        if (item.owner_FK === userID) {
          result.data.push(item);
          return; // continue to the next
        }

        if (privsResp[index].isValid) {
          result.data.push(item);
        }
      });
      break;
    }
    case 'create': {
      if (tableName === 'portfolios') {
        const isOwner = userID == items.owner_FK;
        if (!isOwner) {
          result.data = 'portfolios can only be created by the account owner.';
        }

        result.valid = isOwner;
        break;
      }

      const accessResult = await checkAccess({
        userID,
        tableName,
        itemID: items.parentID,
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
      if (items.owner_FK === userID) {
        result.valid = true;
        break;
      }
      const accessResult = await checkAccess({
        userID,
        tableName,
        itemID: items.id,
        action: 'update',
        columnsNames: items.columnsNames,
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
      if (items.owner_FK === userID) {
        result.valid = true;
        break;
      }

      // console.log(entityName)
      const accessResult = await checkAccess({
        userID,
        tableName,
        itemID: items.id,
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
      const accessResult = await checkAccess({
        userID,
        tableName,
        itemID: items.id,
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
