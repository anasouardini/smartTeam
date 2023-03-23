const pool = require('./dbPool');
const tmpOwnerID = 'github-114059811';
const initQueries = {
  clearDB: `drop table if exists users, portfolios, projects, privilegesCategories, privileges,
            tasks`,
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
  createPrivilegesTable: `create table privileges(
                      owner_FK varchar(50),
                      user varchar(50),
                      portfolioItem_FK varchar(50),
                      projectsItem_FK varchar(50),
                      tasksItem_FK varchar(50),
                      privCat_FK varchar(50),
                      unique(owner_FK, user, portfolioItem_FK, projectsItem_FK, tasksItem_FK, privCat)
                      foreign key(owner_FK) references users(id) on delete cascade,
                      foreign key(user) references users(id) on delete cascade,
                      foreign key(owner_FK, portfolioItem_FK) references portfolios(owner_FK, id) on delete cascade,
                      foreign key(owner_FK, projectsItem_FK) references projects(owner_FK, id) on delete cascade,
                      foreign key(owner_FK, tasksItem_FK) references tasks(owner_FK, id) on delete cascade,
                      foreign key(owner_FK, privCat_FK) references privilegesCategories(owner_FK, id) on delete cascade
                    )`,
  createPriviCategoriesTable: `create table privilegesCategories(
                      id varchar(50),
                      owner_FK varchar(50),
                      priviledge json,
                      primary key(owner_FK, id)
                    )`
};

const init = async () => {
  const queryEntries = Object.entries(initQueries);
  for (let i = 0; i < queryEntries.length; i++) {
    let res = await pool(queryEntries[i][1]);
    // console.log(res[0]);
    if (!res || res?.errno) {
      console.log(['=============================================================']);
      console.log(['error happened while initialising the db: (l80-90 models/db.ts)']);
      console.log(`query: ${queryEntries[i][0]}\n`);
      console.log(res);
      return false;
    }
  }

  return true;
};

module.exports = { init };
