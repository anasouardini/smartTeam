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

let checkAccessResults = [];
const checkAccess = async ({
  userID,
  owner_FK,
  tableName,
  items,
  action,
  columnsNames,
  notFirstCall,
}) => {
  // console.log('---------- start of function', {items});
  const resultTemplate = {
    err: false,
    errMessage: '',
    isValid: false,
    item: {},
  };

  // items might be empty, which means creating ONE item
  for (let i = 0; i < items.length; i++) {
    // console.log('function-start, loop-start')
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
      // console.log('user is owner')
      checkAccessResults.push({
        ...resultTemplate,
        isValid: true,
        item: items?.[i],
      });
      continue;
    }

    // console.log('checking owner and create')
    // after I checked it's not the owner who's performing the action
    if (!isOwner && tableName === 'portfolios' && action === 'create' && !notFirstCall) {
      // console.log('user is not owner and createing portfolio')
      checkAccessResults.push({
        ...resultTemplate,
        isValid: false,
      });
      continue;
    }

    // fetching privileges
    const itemPrivsResp = await Models.privileges.check({
      route: tableName,
      itemID: notFirstCall
        ? itemResp[0]?.[i]?.id
        : items[i].id,
    });
    if (itemPrivsResp.err) {
      checkAccessResults.push({
        ...resultTemplate,
        err: true,
        errMessage: `err while fetching privileges item:${tableName}`,
      });
      continue;
    }


    // check parent if there are no privileges for the current item
    if (!itemPrivsResp[0].length) {
      // console.log('no privs, checking parent')
      const parentTableName = parentsMap[tableName];
      if (parentTableName && parentTableName != 'profile') {
        const parentIDColumn = parentTableName.slice(0, -1) + '_FK';
        let parentID =
          itemResp?.[0]?.[0]?.[parentIDColumn] ??
          items[i].parentID ??
          items[i][parentIDColumn];

        if(!parentID){
          let getParentFromItemResp = await Models[tableName].read({
            id: items[i].id,
            owner_FK,
          });
          if (getParentFromItemResp.err) {
            checkAccessResults.push({
              ...resultTemplate,
              err: true,
              data: 'err while fetching item to get parent id -- syntax error',
            });
            continue;
          }
          if (!getParentFromItemResp[0].length) {
            checkAccessResults.push({
              ...resultTemplate,
              err: true,
              data: 'err while fetching item to get parent id -- no item was found',
            });
            continue;
          }
          parentID = getParentFromItemResp[0][0][parentIDColumn];
        }


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
    // console.log('after checking privs')

    // read is implicitly indicated by the existance of a row in privileges table
    if (action === 'read' || action === 'readAll') {
      checkAccessResults.push({
        ...resultTemplate,
        isValid: true,
        item: items[i],
      });
      continue;
    }

    // console.log('after checking read')

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

    // console.log('after checking update, moving to remove and create')

    // console.log('checkaccess, action: ', action)
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
  // console.log('main function start === ', items)

  let result = { err: false, isValid: false, data: [] };

  checkAccessResults = [];

  switch (action) {
    case 'readSingle': {
      // console.log('-------------------------------------------------- READ SINGLE CASE, ---- ', tableName)
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
      // console.log('-------------------------------------------------- READ ALL CASE ------ ', tableName)
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
      // console.log('-------------------------------------------------- CREATE CASE ---- ', tableName)
      const accessResult = (
        await checkAccess({
          userID,
          owner_FK,
          tableName,
          action,
          items,
        })
      )[0];

      if (accessResult?.err) {
        result.err = accessResult.err;
        result.data = accessResult.data;
        break;
      }
      result.isValid = accessResult.isValid;
      break;
    }
    case 'update': {
      // console.log('-------------------------------------------------- UPDATE CASE ---- ', tableName)
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
      // console.log('-------------------------------------------------- REMOVE CASE ---- ', tableName)

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
        })
      )[0];

      if (accessResult.err) {
        result.err = accessResult.err;
        result.data = accessResult.data;
        break;
      }
      // console.log('remove case, result', accessResult)
      if (accessResult.isValid) {
        result.isValid = true;
      }

      break;
    }
    case 'assign': {
      // console.log(`-------------------------------------------------- ASSIGN CASE --- ${tableName}`)
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
        result = accessResult;
        break;
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
