import { Route, Routes } from 'react-router-dom';
import { Placeholder } from './Placeholder.jsx';

export const PrivateRoutes = props => {
  return (
    <Routes>
      <Route
        path="/*"
        element={<Placeholder title="App"></Placeholder>}
      ></Route>
    </Routes>
  );
};
