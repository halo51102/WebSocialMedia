import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { publicRouters } from './routers'
import { DefaultLayout } from './components/Layout';
import { Fragment } from 'react';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {publicRouters.map((route, index) => {
            const LLayout = route.layout === null ? Fragment : DefaultLayout;
            const Page = route.component;
            return (<Route
              key={index}
              path={route.path}
              element={
                <Page />
              }
            />
            );
          })}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
