const pool = require('./dbPool');

const initQueries = {
  clearDB: `drop table if exists users, portfolios, projects, privilegesCategories, privileges,
            tasks, projectPrivileges, portfolioPrivileges`,
  createUsersTable: `create table users(
                      id varchar(50) primary key,
                      username varchar(20),
                      password varchar(60),
                      email varchar(30),
                      avatar varchar(100),
                      fullname varchar(30),
                      title varchar(30),
                      description varchar(30),
                      createDate dateTime default current_timestamp,
                      verified tinyint default 0
                    )`,
  createPorfoliosTable: `create table portfolios(
                      id varchar(50),
                      ownerID varchar(50),
                      title varchar(50),
                      description varchar(200),
                      projectsNumber int,
                      doneProjectsNumber int,
                      bgImg varchar(100),
                      createDate dateTime default current_timestamp,
                      progress int,
                      status varchar(20),
                      primary key(id, ownerID),
                      foreign key(ownerID) references users(id) on delete cascade
                    )`,
  createProjectsTable: `create table projects(
                      id varchar(50),
                      ownerID varchar(50),
                      portfolio_fk varchar(50),
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
                      primary key(id, ownerID, portfolio_fk),
                      foreign key(portfolio_fk) references portfolios(id) on delete cascade
                    )`,
  createTasksTable: `create table tasks(
                      id varchar(50),
                      ownerID varchar(50),
                      project_fk varchar(50),
                      portfolio_fk varchar(50),
                      assignee_fk varchar(50),
                      title varchar(50),
                      description varchar(200),
                      bgColor varchar(100),
                      createDate dateTime default current_timestamp,
                      dueDate dateTime null,
                      status varchar(20),
                      primary key(id, ownerID, project_fk),
                      foreign key(project_fk) references projects(id) on delete cascade,
                      foreign key(portfolio_fk) references portfolios(id) on delete cascade,
                      foreign key(assignee_fk) references users(id) on delete cascade
                    )`,
  createPrivilegesTable: `create table privileges(
                      user varchar(50),
                      itemID varchar(50),
                      ownerID varchar(50),
                      privCat varchar(50),
                      foreign key(user) references users(id) on delete cascade,
                      unique(user, itemID, privCat)
                    )`,
  createPriviCategoriesTable: `create table privilegesCategories(
                      privCat varchar(50),
                      itemType varchar(10),
                      priv json,
                      primary key(privCat, itemType)
                    )`,
  insertPriviCategories: `insert into privilegesCategories(privCat, itemType, priv)
                          values ('manager', 'portfolio', {'create': true, 'read': true, 'update': true, 'remove'; false})
                        `,
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
