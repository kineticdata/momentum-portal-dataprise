import { useEffect } from 'react';
import { Loading } from './components/states/Loading.jsx';
import { PrivateRoutes } from './pages/PrivateRoutes.jsx';
import { regRedux } from './redux.js';
import { Header } from './components/Header.jsx';
import { Error } from './components/states/Error.js';
import { PublicRoutes } from './pages/PublicRoutes.jsx';
import { Login } from './pages/login/Login.jsx';
import { useSelector } from 'react-redux';

const appActions = regRedux(
  'app',
  { authenticated: false },
  {
    setAuthenticated(state, payload) {
      state.authenticated = payload;
    },
  },
);

export const App = ({
  initialized,
  loggedIn,
  loginProps,
  timedOut,
  serverError,
}) => {
  // Set an `authenticated` flag in global state that is synced to the loggedIn
  // prop, and can be used in the app to determine if the user is authenticated
  const authenticated = useSelector(state => state.app.authenticated);
  useEffect(() => {
    if (authenticated !== loggedIn) {
      appActions.setAuthenticated(loggedIn);
    }
  }, [authenticated, loggedIn]);

  return (
    <div className="flex flex-col flex-auto">
      {loggedIn && <Header></Header>}
      <div className="flex flex-auto">
        {serverError ? (
          <Error error={serverError} />
        ) : !initialized ? (
          <Loading />
        ) : !loggedIn ? (
          // If the user is not logged in, render the public routes, which will
          // default to rendering the login page for all unmatched routes
          <PublicRoutes loginProps={loginProps} />
        ) : (
          // If the user is logged in, render the private routes, and render the
          // Login component in a modal if auth times out
          <>
            <PrivateRoutes />
            {timedOut && (
              <dialog open>
                <Login {...loginProps} />
              </dialog>
            )}
          </>
        )}
      </div>
    </div>
  );
};
