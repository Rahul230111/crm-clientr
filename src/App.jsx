import { Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { routes } from './routes/routes';
import MainLayout from './components/layout/MainLayout';
import { Spin } from 'antd';

const App = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <Suspense
      fallback={
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}>
          <Spin size="large" />
        </div>
      }
    >
      {isLoginPage ? (
        <Routes>
          <Route
            path="/login"
            element={routes.find(r => r.path === '/login').element}
          />
        </Routes>
      ) : (
        <MainLayout>
          <Routes>
            {routes
              .filter(route => route.path !== '/login')
              .map(route => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={route.element}
                />
              ))}
          </Routes>
        </MainLayout>
      )}
    </Suspense>
  );
};

export default App;
