# SmartTeam — Team management app

The purpose of this project is to practice authentication and authorization, I didn't do a very good job at the prior project when it comes to authentication and authorization, so I decided to give it more practice.

The project is about managing teams/projects, where each profile is like an organization, each account has it's own portfolios, projects and tasks within those projects. Each member of the organization has or doesn't have certain privileges to certain portfolio, project or task.

## Tools

### Front-End

1. React
2. React-icons
3. React-query
4. React-table
5. Typescript
6. Tailwind
10. Vite

### Back-End

1. Express.js
3. Axios
4. Mysql2
5. Oauth(googl, github) — manually
8. JWT for user&pasword authentication — refresh token and access token to mitigate the risk of CSRF
9. Bcrypt, also for user&password authentication
11. Email verification (using JWT)
12. Nodemailer (seding email to users to verify their ownership of them)
