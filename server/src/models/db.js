const pool = require('./dbPool');

const initQueries = {
  clearDB: `drop table if exists users, portfolios, projects, tasks, projectPrivileges, portfolioPrivileges`,
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
                      id varchar(50) primary key,
                      title varchar(50),
                      description varchar(200),
                      bgImg varchar(100),
                      createDate dateTime default current_timestamp,
                      progress int,
                      status varchar(20)
                    )`,
  createProjectsTable: `create table projects(
                      id varchar(50) primary key,
                      portfolio_fk varchar(50),
                      title varchar(50),
                      description varchar(200),
                      bgColor varchar(100),
                      createDate dateTime default current_timestamp,
                      dueDate dateTime default current_timestamp,
                      status varchar(20),
                      progress int,
                      milestone varchar(20),
                      budget int,
                      expense int,
                      foreign key(portfolio_fk) references portfolios(id)
                    )`,
  createTasksTable: `create table tasks(
                      id varchar(50) primary key,
                      project_fk varchar(50),
                      assignee_fk varchar(50),
                      title varchar(50),
                      description varchar(200),
                      bgColor varchar(100),
                      createDate dateTime default current_timestamp,
                      status varchar(20),
                      foreign key(project_fk) references projects(id),
                      foreign key(assignee_fk) references users(id)
                    )`,
  createPortfolioPrivilegesTable: `create table portfolioPrivileges(
                      id varchar(50) primary key,
                      manager_fk varchar(50),
                      portfolio_fk varchar(50),
                      createDate dateTime default current_timestamp,
                      createAccess tinyint,
                      readAccess tinyint,
                      updateAccess tinyint,
                      removeAccess tinyint,
                      foreign key(portfolio_fk) references portfolios(id),
                      foreign key(manager_fk) references users(id)
                    )`,
  createProjectPrivilegesTable: `create table projectPrivileges(
                      id varchar(50) primary key,
                      manager_fk varchar(50),
                      project_fk varchar(50),
                      createDate dateTime default current_timestamp,
                      createAccess tinyint,
                      readAccess tinyint,
                      updateAccess tinyint,
                      removeAccess tinyint,
                      foreign key(project_fk) references projects(id),
                      foreign key(manager_fk) references users(id)
                    )`,
};

const initi = async () => {
  const queries = Object.entries(initQueries);
  for (let i = 0; i < queries.length; i++) {
    let res = await pool(queries[i][1]);
    // console.log(res[0]);
    if (!res || res?.errno) {
      console.log(['=============================================================']);
      console.log(['error happened while initialising the db: (l80-90 models/db.ts)']);
      console.log(`query: ${queries[i][0]}\n`);
      console.log(res);
      return false;
    }
  }

  return true;
};

module.exports = { initi };
