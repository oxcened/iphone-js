import React, { useMemo } from 'react';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import FullScreenSpinner from './structural/Spinner/FullScreenSpinner';
import Phone from './structural/Phone/Phone';
import phoneApps from './phoneApps/phoneApps';

const Home = React.lazy(() => import('./structural/Home/Home'));

function App() {
  const phoneAppsRoutes = useMemo(() => {
    return phoneApps.map(app => {
      const Element = app.element;
      return (
        <Route key={app.id} path={app.route} element={<Element />} />
      );
    });
  }, []);

  return (
    <div className='app'>
      <Phone>
        <React.Suspense fallback={<FullScreenSpinner />}>
          <BrowserRouter>
            <Routes>
              <Route path='/' element={<Home />} />
              {phoneAppsRoutes}
            </Routes>
          </BrowserRouter>
        </React.Suspense>
      </Phone>
    </div>
  );
}

export default App;
