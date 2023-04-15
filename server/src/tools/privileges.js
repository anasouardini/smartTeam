const Models = {
  MPrivileges: require('../models/privileges'),
  MPortfolios: require('../models/portfolio'),
  MProjects: require('../models/project'),
};

const parentsMap = {
  portfolios: 'profile',
  projects: 'portfolios',
  tasks: 'projects',
};

const checkAccessResults = [];
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
    const isOwner = items[i].owner_FK == userID;
    if (isOwner) {
      checkAccessResults[i] = {
        ...resultTemplate,
        isValid: true,
        item: items[i],
      };
      continue;
    }

    // after I checked it's not the owner who's performing the action
    if(!isOwner && tableName === 'portfolios' && action === 'create'){
      checkAccessResults[i] = {
        ...resultTemplate,
        isValid: false,
      };
      continue;
    }

    // fetching privileges
    // console.log(tableName);
    const parentPrivsResp = await Models.MPrivileges.check({
      route: tableName,
      itemID: checkParents ? itemResp[0][0].id : items[0].id,
    });
    if (parentPrivsResp.err) {
      checkAccessResults[i] = {
        ...resultTemplate,
        err: true,
        errMessage: 'err while fetching privileges',
      };
      continue;
    }

    // check parent if there are no privileges for the current item
    if (!parentPrivsResp[0].length) {
      const parentTableName = parentsMap?.[tableName.slice(0, -1) + '_FK'];
      if (parentTableName && parentTableName != 'profile') {
        const parentID = itemResp[0][0][parentTableName];
        return checkAccess({
          userID,
          tableName: parentTableName,
          items: [{ id: parentID, owner_FK: items[i].owner_FK }],
          action,
          checkParents: true,
        });
      }
      checkAccessResults[i] = { ...resultTemplate };
      continue;
    }

    // read is implicitly indicated by the existance of a row in privileges table
    if (action === 'read' || action === 'readAll') {
      checkAccessResults[i] = {
        ...resultTemplate,
        isValid: true,
        item: items[i],
      };
      continue;
    }

    // check if has privileges for the provided action
    const privSection = checkParents ? 'childrenItems' : 'currentItem';
    const privilegesObj = parentPrivsResp[0][0].privilege;
    // console.log(privilegesObj)

    if (action === 'update') {
      let canUpdate = privilegesObj[privSection].update.all;
      // console.log(canUpdate)
      if (!canUpdate && !checkParents) {
        canUpdate = columnsNames.every(
          (columnName) => privilegesObj[privSection].update?.[columnName]
        );
      }
      // console.log(privilegesObj[privSection])
      checkAccessResults[i] = { ...resultTemplate, isValid: canUpdate };
      continue;
    }

    checkAccessResults[i] = {
      ...resultTemplate,
      isValid: privilegesObj[privSection]?.[action],
    };
    continue;
  }

  return checkAccessResults;
};

const check = async ({ tableName, action, userID, items, columnsNames }) => {
  const result = { err: false, isValid: false, data: [] };

  switch (action) {
    case 'readSingle': {
      const accessResult = await checkAccess({
        userID,
        tableName,
        items,
        action,
      });

      if (accessResult[0].isValid) {
        result.isValid = accessResult[0].isValid;
        result.data = items;
      }
      break;
    }
    case 'readAll': {
      result.isValid = true;
      if (!items.length) {
        break;
      }

      // console.log('parent', tableName);
      const privsResp = await checkAccess({
        userID,
        tableName,
        items: items,
        action,
      });
      // console.log(privsResp)

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

      const accessResult = (await checkAccess({
        userID,
        tableName,
        items: items,
        action,
      }))[0];

      if (accessResult.err) {
        result.err = accessResult.err;
        result.data = accessResult.data;
        break;
      }
        result.isValid = accessResult.isValid;
      break;
    }
    case 'update': {
      if (items.owner_FK === userID) {
        result.isValid = true;
        break;
      }
      const accessResult = (await checkAccess({
        userID,
        tableName,
        items: items,
        action,
        columnsNames,
      }))[0];

      if (accessResult.err) {
        result.err = accessResult.err;
        result.data = accessResult.data;
        break;
      }
      result.isValid = accessResult.isValid;

      // console.log(accessResult);
      // console.log(result);

      break;
    }
    case 'remove': {
      if (items.owner_FK === userID) {
        result.isValid = true;
        break;
      }

      // console.log(entityName)
      const accessResult = (await checkAccess({
        userID,
        tableName,
        items: items,
        action,
      }))[0];

      if (accessResult.err) {
        result.err = accessResult.err;
        result.data = accessResult.data;
        break;
      }
      if (accessResult.isValid) {
        result.isValid = true;
      }

      break;
    }
    case 'assign': {
      const accessResult = (await checkAccess({
        userID,
        tableName,
        items: items,
        action,
      }))[0];

      if (accessResult.err) {
        result.err = accessResult.err;
        result.data = accessResult.data;
      }
      if (accessResult.isValid) {
        result.isValid = true;
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
