const Models = {
  privileges: require('../models/privileges'),
  portfolios: require('../models/portfolio'),
  projects: require('../models/project'),
};

const parentsMap = {
  portfolios: 'profile',
  projects: 'portfolios',
  tasks: 'projects',
};

const checkAccessResults = [];
const checkAccess = async ({
  userID,
  owner_FK,
  tableName,
  items,
  action,
  columnsNames,
  notFirstCall,
}) => {
  // console.log('---------- start of function');
  const resultTemplate = {
    err: false,
    errMessage: '',
    isValid: false,
    item: {},
  };

  // items might be empty, which means creating ONE item
  const loopCount = items == undefined && action == 'create' ? 1 : items.length;
  for (let i = 0; i < loopCount; i++) {
    let itemResp;
    if (notFirstCall) {
      itemResp = await Models[tableName].read({
        id: items[0].id,
        owner_FK,
      });
      // console.log(
      //   'get parent',
      //   { tableName: tableName, id: items[0].id, owner_FK },
      //   itemResp[0]
      // );

      // when it's not the first call, you just return 
      // return and continue have the same effect, but it indicates better

      if (itemResp.err) {
        checkAccessResults.push({
          ...resultTemplate,
          err: true,
          data: 'err while fetching privileges in checkAceess -- syntax error in privileges/check',
        });
        return;
      }
      if (!itemResp[0].length) {
        checkAccessResults.push({
          ...resultTemplate,
          err: true,
          data: 'err while fetching item in checkAceess -- no item was found',
        });
        return;
      }
    }

    // check if the user is the owner
    const isOwner = owner_FK == userID;
    if (isOwner) {
      checkAccessResults.push({
        ...resultTemplate,
        isValid: true,
        item: items[i],
      });
      continue;
    }

    // after I checked it's not the owner who's performing the action
    if (!isOwner && tableName === 'portfolios' && action === 'create') {
      checkAccessResults.push({
        ...resultTemplate,
        isValid: false,
      });
      continue;
    }

    // debugging
    if (!itemResp) {
      // console.log('privcheck, first run -- items', items);
    } else {
      // console.log('privcheck, not first run -- parentResp', itemResp[0]);
    }
    // fetching privileges
    const itemPrivsResp = await Models.privileges.check({
      route: tableName,
      itemID: notFirstCall ? itemResp[0]?.[i]?.id : items[i].id,
    });
    if (itemPrivsResp.err) {
      checkAccessResults.push({
        ...resultTemplate,
        err: true,
        errMessage: 'err while fetching privileges',
      });
      continue;
    }

    // check parent if there are no privileges for the current item
    if (!itemPrivsResp[0].length) {
      const parentTableName = parentsMap[tableName];
      if (parentTableName && parentTableName != 'profile') {
        const parentIDColumn = parentTableName.slice(0, -1) + '_FK';
        const parentID =
          itemResp?.[0]?.[0]?.[parentIDColumn] ??
          items[i].parentID ??
          items[i][parentIDColumn];
        // console.log('recursing', parentTableName);
        // console.log('getting parent id', parentID);

        // TODO: the recursion call has to indicate if privileges are valid
        await checkAccess({
          userID,
          owner_FK,
          tableName: parentTableName,
          items: [{ id: parentID }],
          action,
          notFirstCall: true,
        });
        continue;
      }
      checkAccessResults.push({ ...resultTemplate });
      continue;
    }

    // read is implicitly indicated by the existance of a row in privileges table
    if (action === 'read' || action === 'readAll') {
      checkAccessResults.push({
        ...resultTemplate,
        isValid: true,
        item: items[i],
      });
      continue;
    }

    // check if has privileges for the provided action
    const privSection = notFirstCall ? 'childrenItems' : 'currentItem';
    const privilegesObj = itemPrivsResp[0][0].privilege;
    // console.log(privilegesObj)

    if (action === 'update') {
      let canUpdate = privilegesObj[privSection].update.all;
      // console.log(canUpdate)
      if (!canUpdate && !notFirstCall) {
        canUpdate = columnsNames.every(
          (columnName) => privilegesObj[privSection].update?.[columnName]
        );
      }
      // console.log(privilegesObj[privSection])
      checkAccessResults.push({ ...resultTemplate, isValid: canUpdate });
      continue;
    }

    // update and read are handled above, what's left is remove and create
    checkAccessResults.push({
      ...resultTemplate,
      isValid: privilegesObj[privSection]?.[action],
    });
    continue;
  }

  return checkAccessResults;
};

const check = async ({
  tableName,
  owner_FK,
  action,
  userID,
  items,
  columnsNames,
}) => {
  const result = { err: false, isValid: false, data: [] };

  switch (action) {
    case 'readSingle': {
      const accessResult = await checkAccess({
        userID,
        owner_FK,
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
        owner_FK,
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
      const accessResult = (
        await checkAccess({
          userID,
          owner_FK,
          tableName,
          action,
        })
      )[0];

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
      const accessResult = (
        await checkAccess({
          owner_FK,
          userID,
          tableName,
          items: items,
          action,
          columnsNames,
        })
      )[0];

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
      const accessResult = (
        await checkAccess({
          owner_FK,
          userID,
          tableName,
          items: items,
          action,
        })
      )[0];

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
      const accessResult = (
        await checkAccess({
          owner_FK,
          userID,
          tableName,
          items: items,
          action,
        })
      )[0];

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
