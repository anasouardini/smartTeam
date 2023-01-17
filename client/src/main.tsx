import ReactDOM from 'react-dom/client';
import './index.css';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Authentication from './pages/shared/authentication';
// import Login from './pages/login';
// import Signup from './pages/signup';
import Profile from './pages/profile';
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
      </Route>
    </Routes>
  </BrowserRouter>
);

import { QueryClient, QueryClientProvider } from 'react-query';
const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: true } },
});
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <QueryClientProvider client={queryClient}>
    <MyRouter />
  </QueryClientProvider>
);
