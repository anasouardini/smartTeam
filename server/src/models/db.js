const pool = require('./dbPool');
const {v4:uuid} = require('uuid');
const defaultOwnerID = 'organization-organization';

require('dotenv').config()

// TODO: an instance of this for each account/user
const defaultPrivileges = [
  [
    'creator',
    defaultOwnerID,
    JSON.stringify({
      currentItem: { update: { all: true }, remove: true, assign: true },
      childrenItems: { update: { all: true }, remove: true, create: true, assign: true },
    }),
  ],
  [
    'manager',
    defaultOwnerID,
    JSON.stringify({
      currentItem: { update: { all: false, status: true }, remove: false, assign: false },
      childrenItems: { update: { all: true }, remove: true, create: true, assign: true },
    }),
  ],
  [
    'watcher',
    defaultOwnerID,
    JSON.stringify({
      currentItem: { update: { all: false }, remove: false, assign: false },
      childrenItems: { update: { all: false }, remove: false, create: false, assign: false },
    }),
  ],
  [
    'worker',
    defaultOwnerID,
    JSON.stringify({
      currentItem: { update: { all: false, status: true }, remove: false, assign: false },
      childrenItems: { update: { all: false }, remove: false, create: false, assign: false },
    }),
  ],
];

const initQueries = {
  clearDB: `drop table if exists users, connections, portfolios, projects, tasks, privilegesCategories, privileges;`,
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
                      title varchar(50),
                      description varchar(200),
                      projectsNumber int,
                      doneProjectsNumber int,
                      bgImg varchar(100),
                      createDate dateTime default current_timestamp,
                      progress int,
                      status varchar(20),
                      primary key(owner_FK, id),
                      foreign key(owner_FK) references users(id) on delete cascade
                    )`,
  createProjectsTable: `create table projects(
                      id varchar(50),
                      owner_FK varchar(50),
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
                      foreign key(owner_FK, portfolio_FK) references portfolios(owner_FK, id) on delete cascade
                    )`,
  createTasksTable: `create table tasks(
                      id varchar(50),
                      owner_FK varchar(50),
                      project_FK varchar(50),
                      title varchar(50),
                      description varchar(200),
                      bgColor varchar(100),
                      createDate dateTime default current_timestamp,
                      dueDate dateTime null,
                      status varchar(20),
                      primary key(owner_FK, id),
                      foreign key(owner_FK) references users(id) on delete cascade,
                      foreign key(owner_FK, project_FK) references projects(owner_FK, id) on delete cascade
                    )`,
  createPriviCategoriesTable: `create table privilegesCategories(
                      id varchar(50),
                      owner_FK varchar(50),
                      privilege json,
                      primary key(owner_FK, id)
                    )`,
  createPrivilegesTable: `create table privileges(
                      id varchar(50),
                      owner_FK varchar(50),
                      user varchar(50),
                      portfolio_FK varchar(50),
                      project_FK varchar(50),
                      task_FK varchar(50),
                      privCat_FK varchar(50),
                      unique(owner_FK, user, portfolio_FK, project_FK, task_FK, privCat_FK),
                      foreign key(owner_FK) references users(id) on delete cascade,
                      foreign key(user) references users(id) on delete cascade,
                      foreign key(owner_FK, portfolio_FK) references portfolios(owner_FK, id) on delete cascade,
                      foreign key(owner_FK, project_FK) references projects(owner_FK, id) on delete cascade,
                      foreign key(owner_FK, task_FK) references tasks(owner_FK, id) on delete cascade,
                      foreign key(owner_FK, privCat_FK) references privilegesCategories(owner_FK, id) on delete cascade
                    )`,
  createConnectionsTable: `create table connections(
                      userA_FK varchar(50),
                      userB_FK varchar(50),
                      foreign key(userA_FK) references users(id) on delete cascade,
                      foreign key(userB_FK) references users(id) on delete cascade
                    );`
};

const insertionQueries = {
  insertDefaultUser: `insert into users(id, username, password, avatar, fullname, verified)
                      values(
                            'github-114059811',
                            'segfaulty1',
                            '',
                            'https://avatars.githubusercontent.com/u/114059811?v=4',
                            'Ouardini Anas',
                            1
                            ),
                            (
                            'organization-organization',
                            'organization',
                            '$2a$10$vrGBAXzwHyuL4f8wtp9LtuqJisgrwvYHHUQChFh19h6.h/h/PPGd.',
                            '${process.env.DEV_SERVER_ADDRESS}/media/avatars/orange-fluffy-face.jpg',
                            'organization',
                            1
                            ),
                            (
                            'venego-venego-venego-venego',
                            'venego',
                            '$2a$10$2Rs1OQprscaedMDIfa3nM.Rkd4wlUSB/1Y9aniUUF5vNftStoy33G',
                            '${process.env.DEV_SERVER_ADDRESS}/media/avatars/orange-fluffy-face.jpg',
                            'venego',
                            1
                            ),
                            (
                            'segfaulty-segfaulty-segfaulty',
                            'segfaulty',
                            '$2a$10$nClU9iPu63tTwErJXhQ1guqMdEtUTZoLhc2NmToZZpgq/8Elm0fmK',
                            '${process.env.DEV_SERVER_ADDRESS}/media/avatars/orange-fluffy-face.jpg',
                            'segfaulty',
                            1
                            ),
                            (
                            'potato-potato-potato-potato',
                            'potato',
                            '$2a$10$pOJ54FmgEmrQp9RJsUopvusKhtNB/EgVAzj1zUB5GYy6ycFIyiUnW',
                            '${process.env.DEV_SERVER_ADDRESS}/media/avatars/orange-fluffy-face.jpg',
                            'potato',
                            1
                            )
                      ;`,
  insertDefaultPrivilegesCategories: `insert into privilegesCategories(id, owner_FK, privilege)
                            values( ?, ?, ?)`,
  insertDefaultPortfolios: `insert into portfolios(id, owner_FK, title, description, bgImg,
                                                    status, progress, projectsNumber, doneProjectsNumber)
                            values( ?, ?, ?, ?, ?, ?, ?, ? ,?)
                        `,
  insertDefaultProjects: `insert into projects(id, owner_FK, portfolio_FK, title, description, bgColor,
                                                  status, progress, milestone, budget, expense)
                          values( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `,
  insertDefaultTasks: `insert into tasks(id, owner_FK, project_FK, title, description, bgColor,
                                              status)
                        values( ?, ?, ?, ?, ?, ?, ?)
                        `,
};

const init = async () => {

  // initializing tables
  const initQueryEntries = Object.entries(initQueries);
  for (let i = 0; i < initQueryEntries.length; i++) {
    // console.log(initQueryEntries[i][0])
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

  // inserting default privileges categories
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

  // insertDefaultPortfolios: `insert into portfolios(id, owner_FK, title, description, bgImg,
  //                                                   status, progress, projectNumber, doneProjectsNumber)
  //                           values( ?, ?, ?, ?, ?, ?, ?, ? ,?)
  //                       `,
  // insertDefaultProjects: `insert into projects(id, owner_FK, portfolio_FK, title, description, bgColor,
  //                                                 dueDate, status, progress, milestone, budget, expense)
  //                         values( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  //                       `,
  // insertDefaultTasks: `insert into tasks(id, owner_FK, project_FK, title, description, bgColor,
  //                                             status)
  //                       values( ?, ?, ?, ?, ?, ?, ?)
  //                       `,
  const users = [
                  'github-114059811',
                  'segfaulty-segfaulty-segfaulty',
                  'organization-organization',
                  'venego-venego-venego-venego',
                  'potato-potato-potato-potato'
                ]
  for(let i=0; i<users.length; i++){
    const portfolioVars = [uuid(), users[i], 'initial portfolio', '', '', '', 0, 1, 0];
    let resp = await pool(insertionQueries.insertDefaultPortfolios, portfolioVars);

    const projectVars = [uuid(), users[i], portfolioVars[0], 'initial project', '', '', '', 0, '', 40, 2];
    resp = await pool(insertionQueries.insertDefaultProjects, projectVars);

    const taskVars = [uuid(), users[i], projectVars[0], 'initial task', '', '', ''];
    resp = await pool(insertionQueries.insertDefaultTasks, taskVars);
  };

  return true;
};

module.exports = { init };
