import { Route, Routes } from 'react-router-dom';
import { Placeholder } from './Placeholder.jsx';
import {Login} from "./login/Login.jsx";

export const PublicRoutes = ({loginProps}) => {
  return (
    <Routes>
      <Route
        path="/public/*"
        element={<Placeholder title="Public App"></Placeholder>}
      ></Route>
      <Route
        path="/*"
        element={<Login {...loginProps} />}
      ></Route>
    </Routes>
  );
};
