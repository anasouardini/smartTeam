import ReactDOM from 'react-dom/client';
import './index.css';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Authentication from './pages/shared/authentication';
// import Login from './pages/login';
// import Signup from './pages/signup';
import Profile from './pages/profile';
import SharedLayout from './components/sharedLayout';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<SharedLayout />}>
          <Route
            path='/login'
            element={
              <Authentication
                label='signup'
                title='create new account'
                fields={['username', 'password']}
              />
            }
          ></Route>
          <Route
            path='/signup'
            element={
              <Authentication
                label='signup'
                title='create new account'
                fields={['username', 'password', 'email']}
              />
            }
          ></Route>
          <Route path='/:user' element={<Profile />}></Route>
        </Route>
      </Routes>
    </BrowserRouter>
  </>
);
