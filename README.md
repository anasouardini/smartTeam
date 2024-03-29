# SmartTeam — Team management app | <a href="https://smartteam.anasouardini.online" target="_blank">Check It Live</a>

The purpose of this project is to practice authentication and authorization. I didn't do a very good job on the previous project when it came to authentication and authorization, so I decided to give it more practice.

The project is about managing teams/projects, where each profile is like an organization. Each account has its own portfolios, projects, and tasks within those projects. Each member of the organization may or may not have certain privileges for specific portfolios, projects, or tasks

<img src="https://github.com/anasouardini/smartTeam/assets/114059811/1522ce74-7c9b-4b35-8bd8-477ca711cb18" alt="project's (smartteam) login page " style="width: 50%"/>
<img src="https://github.com/anasouardini/smartTeam/assets/114059811/6f1878a8-d0ea-41ef-9b7c-35e90990a7b1" alt="Project's (smartteam) profile page" style="width: 50%"/>

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
12. Nodemailer (seding email to users to verify their ownership)
