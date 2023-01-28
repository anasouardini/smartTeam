import ReactDOM from 'react-dom/client';
import './index.css';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Authentication from './pages/shared/authentication';
// import Login from './pages/login';
// import Signup from './pages/signup';
import Profile from './pages/profile';
import Portfolios from './pages/portfolios';
import Projects from './pages/projects';
import SharedLayout from './components/sharedLayout';

const MyRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path='/' element={<SharedLayout />}>
        <Route
          path='/login'
          element={
            <Authentication
              label='login'
              title='Login to your account'
              fields={[
                ['username', 'text'],
                ['password', 'password'],
              ]}
            />
          }
        />
        <Route
          path='/signup'
          element={
            <Authentication
              label='signup'
              title='create new account'
              fields={[
                ['fullname', 'text'],
                ['username', 'text'],
                ['email', 'email'],
                ['password', 'password'],
              ]}
            />
          }
        />
        <Route path='/user/:user' element={<Profile />} />
        <Route path='/portfolios' element={<Portfolios />} />
        <Route path='/projects' element={<Projects />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

import { QueryClient, QueryClientProvider } from 'react-query';
const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: true } },
});

document.getElementById('root')?.remove();
const rootElm = document.createElement('div');
rootElm.setAttribute('id', 'root');
rootElm.setAttribute('class', 'flex min-h-[100vh]');
document.body.appendChild(rootElm);

ReactDOM.createRoot(rootElm as HTMLElement).render(
  <QueryClientProvider client={queryClient}>
    <MyRouter />
  </QueryClientProvider>
);
