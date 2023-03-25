const pool = require('./dbPool');
// const {uuidv4:uuid} = require('uuid');
const defaultOwnerID = 'github-114059811';
const defaultPrivileges = [
  [
    'creator',
    defaultOwnerID,
    JSON.stringify({
      currentItem: { update: {all:true}, delete: true, assign: true },
      childrenItems: { update: { all: true }, delete: true, create: true, assign: true },
    }),
  ],
  [
    'manager',
    defaultOwnerID,
    JSON.stringify({
      currentItem: { update: {all:false}, delete: false, assign: false },
      childrenItems: { update: { all: true }, delete: true, create: true, assign: true },
    }),
  ],
  [
    'watcher',
    defaultOwnerID,
    JSON.stringify({
      currentItem: { update: {all:false}, delete: false, assign: false },
      childrenItems: { update: { all: false }, delete: false, create: false, assign: false },
    }),
  ],
  [
    'worker',
    defaultOwnerID,
    JSON.stringify({
      currentItem: { update: {all:false, status: true}, delete: false, assign: false },
      childrenItems: { update: { all:false}, delete: false, create: false, assign: false },
    }),
  ],
];

const initQueries = {
  clearDB: `drop table if exists users, portfolios, projects, tasks, privilegesCategories, privileges;`,
  createUsersTable: `create table users(
                      id varchar(50),
                      username varchar(20),
                      password varchar(60),
                      email varchar(30),
                      avatar varchar(100),
                      fullname varchar(30),
                      title varchar(30),
                      description varchar(30),
                      createDate dateTime default current_timestamp,
                      verified tinyint default 0,
                      primary key(id)
                    )`,
  createPorfoliosTable: `create table portfolios(
                      id varchar(50),
                      owner_FK varchar(50),
                      creator_FK varchar(50),
                      assignee_FK varchar(50),
                      title varchar(50),
                      description varchar(200),
                      projectsNumber int,
                      doneProjectsNumber int,
                      bgImg varchar(100),
                      createDate dateTime default current_timestamp,
                      progress int,
                      status varchar(20),
                      primary key(owner_FK, id),
                      foreign key(owner_FK) references users(id) on delete cascade,
                      foreign key(creator_FK) references users(id) on delete cascade,
                      foreign key(assignee_FK) references users(id) on delete cascade
                    )`,
  createProjectsTable: `create table projects(
                      id varchar(50),
                      owner_FK varchar(50),
                      creator_FK varchar(50),
                      assignee_FK varchar(50),
                      portfolio_FK varchar(50),
                      title varchar(50),
                      description varchar(200),
                      bgColor varchar(100),
                      createDate dateTime default current_timestamp,
                      dueDate dateTime null,
                      status varchar(20),
                      progress int,
                      milestone varchar(20),
                      budget int,
                      expense int,
                      primary key(owner_FK, id),
                      foreign key(owner_FK) references users(id) on delete cascade,
                      foreign key(creator_FK) references users(id) on delete cascade,
                      foreign key(assignee_FK) references users(id) on delete cascade,
                      foreign key(owner_FK, portfolio_FK) references portfolios(owner_FK, id) on delete cascade
                    )`,
  createTasksTable: `create table tasks(
                      id varchar(50),
                      owner_FK varchar(50),
                      creator_FK varchar(50),
                      assignee_FK varchar(50),
                      project_FK varchar(50),
                      title varchar(50),
                      description varchar(200),
                      bgColor varchar(100),
                      createDate dateTime default current_timestamp,
                      dueDate dateTime null,
                      status varchar(20),
                      primary key(owner_FK, id),
                      foreign key(owner_FK) references users(id) on delete cascade,
                      foreign key(creator_FK) references users(id) on delete cascade,
                      foreign key(assignee_FK) references users(id) on delete cascade,
                      foreign key(owner_FK, project_FK) references projects(owner_FK, id) on delete cascade
                    )`,
  createPriviCategoriesTable: `create table privilegesCategories(
                      id varchar(50),
                      owner_FK varchar(50),
                      priviledge json,
                      primary key(owner_FK, id)
                    )`,
  createPrivilegesTable: `create table privileges(
                      owner_FK varchar(50),
                      user varchar(50),
                      portfolioItem_FK varchar(50),
                      projectsItem_FK varchar(50),
                      tasksItem_FK varchar(50),
                      privCat_FK varchar(50),
                      unique(owner_FK, user, portfolioItem_FK, projectsItem_FK, tasksItem_FK, privCat_FK),
                      foreign key(owner_FK) references users(id) on delete cascade,
                      foreign key(user) references users(id) on delete cascade,
                      foreign key(owner_FK, portfolioItem_FK) references portfolios(owner_FK, id) on delete cascade,
                      foreign key(owner_FK, projectsItem_FK) references projects(owner_FK, id) on delete cascade,
                      foreign key(owner_FK, tasksItem_FK) references tasks(owner_FK, id) on delete cascade,
                      foreign key(owner_FK, privCat_FK) references privilegesCategories(owner_FK, id) on delete cascade
                    )`,
};

const insertionQueries = {
  insertDefaultUser: `insert into users(id, username, avatar, fullname, verified)
                      value(
                            'github-114059811',
                            'segfaulty1',
                            'https://avatars.githubusercontent.com/u/114059811?v=4',
                            'Ouardini Anas',
                            1
                            );`,
  insertDefaultPrivilegesCategories: `insert into privilegesCategories(id, owner_FK, priviledge)
                        values( ?, ?, ?)`,
};

const init = async () => {
  // initializing tables
  const initQueryEntries = Object.entries(initQueries);
  for (let i = 0; i < initQueryEntries.length; i++) {
    let res = await pool(initQueryEntries[i][1]);
    // console.log(res[0]);
    if (!res || res?.errno) {
      console.log([
        '=============================================================',
      ]);
      console.log(['error happened while initialising the db: (models/db.ts)']);
      console.log(`query: ${initQueryEntries[i][1]}\n`);
      console.log(res);
      return false;
    }
  }

  // inserting default users
  const usersEntry = insertionQueries['insertDefaultUser'];
  let res = await pool(usersEntry);
  if (!res || res?.errno) {
    console.log([
      '=============================================================',
    ]);
    console.log(['error happened while iserting default user: (models/db.ts)']);
    console.log(`query: ${usersEntry}\n`);
    console.log(res);
    return false;
  }

  // inserting default priviledges categories
  const privilegesQueryEntry =
    insertionQueries['insertDefaultPrivilegesCategories'];
  for (let i = 0; i < defaultPrivileges.length; i++) {
    let res = await pool(privilegesQueryEntry, defaultPrivileges[i]);
    // console.log(res[0]);
    if (!res || res?.errno) {
      console.log([
        '=============================================================',
      ]);
      console.log([
        'error happened while iserting default privilegesCategories: (models/db.ts)',
      ]);
      console.log(`query: ${privilegesQueryEntry}\n`);
      console.log(res);
      return false;
    }
  }

  return true;
};

module.exports = { init };
