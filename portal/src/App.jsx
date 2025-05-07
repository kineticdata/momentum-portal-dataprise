import { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import t from 'prop-types';
import clsx from 'clsx';
import {
  fetchKapp,
  fetchProfile,
  fetchSpace,
  searchSubmissions,
} from '@kineticdata/react';
import { Toaster } from './atoms/Toaster.jsx';
import { Loading } from './components/states/Loading.jsx';
import { Error } from './components/states/Error.jsx';
import { closeConfirm } from './helpers/confirm.js';
import { appActions, themeActions } from './helpers/state.js';
import { clearToasts } from './helpers/toasts.js';
import useRouteChange from './helpers/hooks/useRouteChange.js';
import { PrivateRoutes } from './pages/PrivateRoutes.jsx';
import { PublicRoutes } from './pages/PublicRoutes.jsx';
import { Login } from './pages/login/Login.jsx';
import { ConfirmationModal } from './components/confirm/ConfirmationModal.jsx';
import { useData } from './helpers/hooks/useData.js';
import { AccessWrapper } from './AccessWrapper.jsx';

export const App = ({
  initialized,
  loggedIn,
  loginProps,
  timedOut,
  serverError,
}) => {
  // Get redux theme state
  const { css: themeCSS } = useSelector(state => state.theme);
  // Update the styles if there is a theme set
  useEffect(() => {
    if (themeCSS) {
      // If themeCSS exists, create a stylesheet and set themeCSS as the content
      const cssSheet = new CSSStyleSheet();
      cssSheet.replace(themeCSS);
      // Set this new constructed stylesheet to be used by the page
      document.adoptedStyleSheets = [cssSheet];
    }
  }, [themeCSS]);

  // Get redux app state
  const { authenticated, kappSlug, error, space, kapp, profile, cid, config } =
    useSelector(state => state.app);

  // Set an `authenticated` flag in global state that is synced to the loggedIn
  // prop, and can be used in the app to determine if the user is authenticated
  useEffect(() => {
    if (authenticated !== loggedIn) {
      appActions.setAuthenticated(loggedIn);
    }
  }, [authenticated, loggedIn]);

  // Fetch space data. We'll assume that the space record is available publicly
  // so we can get the config data stored in space attributes
  const spaceParams = useMemo(
    () =>
      initialized
        ? loggedIn
          ? { include: 'attributesMap,kapps' }
          : { public: true, include: 'attributesMap,kapps' }
        : null,
    [initialized, loggedIn],
  );
  const {
    initialized: spaceInit,
    loading: spaceLoading,
    response: spaceData,
  } = useData(fetchSpace, spaceParams);
  // Set the space data into redux
  useEffect(() => {
    if (spaceInit && !spaceLoading) {
      appActions.setSpace(spaceData);
    }
  }, [spaceInit, spaceLoading, spaceData]);

  // Fetch profile data once the user is logged in
  const profileParams = useMemo(
    () =>
      initialized && loggedIn
        ? { include: 'profileAttributesMap,attributesMap,memberships' }
        : null,
    [initialized, loggedIn],
  );
  const {
    initialized: profileInit,
    loading: profileLoading,
    response: profileData,
  } = useData(fetchProfile, profileParams);
  // Set the profile data into redux
  useEffect(() => {
    if (profileInit && !profileLoading) {
      appActions.setProfile(profileData);
    }
  }, [profileInit, profileLoading, profileData]);

  // Fetch kapp data once the user is logged in and a kapp slug is set, which
  // happens after the space is retrieved
  const kappParams = useMemo(
    () =>
      initialized && loggedIn && kappSlug
        ? {
            kappSlug,
            include: 'attributesMap,categories,categories.attributesMap',
          }
        : null,
    [initialized, loggedIn, kappSlug],
  );
  const {
    initialized: kappInit,
    loading: kappLoading,
    response: kappData,
  } = useData(fetchKapp, kappParams);
  // Set the space data into redux
  useEffect(() => {
    if (kappInit && !kappLoading) {
      appActions.setKapp(kappData);
    }
  }, [kappInit, kappLoading, kappData]);

  // Fetch the client config data once we have a user with a CID
  const configParams = useMemo(
    () =>
      cid
        ? {
            kapp: 'datastore',
            form: 'client-configuration',
            search: {
              include: ['values'],
              limit: 1,
              q: `values[CID] = "${cid}"`,
              // q: `values[Status] = "Active" AND values[CID] = "${cid}"`,
            },
          }
        : null,
    [cid],
  );
  const {
    initialized: configInit,
    loading: configLoading,
    response: configData,
  } = useData(searchSubmissions, configParams);
  // Set the config data into redux
  useEffect(() => {
    if (configInit && !configLoading) {
      appActions.setConfig(configData);
      themeActions.setConfig(configData);
    }
  }, [configInit, configLoading, configData]);

  // Clear toasts and confirmation modals whenever we change routes
  useRouteChange((pathname, state) => {
    if (!state?.persistToasts) {
      clearToasts();
    }
    closeConfirm();
  }, []);

  return (
    <>
      <div className="flex flex-col flex-auto overflow-auto">
        {/* Header element where we will render headers via a portal */}
        <header id="app-header" />

        <main
          id="app-main"
          className={clsx(
            'flex flex-col flex-auto relative overflow-y-auto overflow-x-hidden scrollbar',
          )}
        >
          {serverError || error ? (
            // If an error occurred during auth or fetching app data, show an
            // error screen
            <Error error={serverError || error} header={true} />
          ) : !initialized || !space || (cid && !config) ? (
            // If auth isn't initialized or space record isn't fetched, show a
            // loading screen
            <Loading />
          ) : !loggedIn ? (
            // If the user is not logged in, render the public routes, which
            // will default to rendering the login page for all unmatched routes
            <PublicRoutes loginProps={loginProps} />
          ) : kapp && profile ? (
            // If the user is logged in and kapp and profile data has been
            // fetched, render the private routes, and render the Login
            // component in a modal if auth times out
            <>
              <AccessWrapper cid={cid} profile={profile} config={config}>
                <PrivateRoutes />
              </AccessWrapper>
              {timedOut && (
                <dialog open>
                  <Login {...loginProps} />
                </dialog>
              )}
            </>
          ) : (
            <Loading />
          )}

          {/* Toast container */}
          <Toaster />
        </main>

        {/* Footer element where we will render footers via a portal */}
        <footer id="app-footer" />
      </div>

      {/* Panels element where we will render panels via a portal */}
      <div id="app-panels" />

      {/* Global confirmation modal */}
      <ConfirmationModal />
    </>
  );
};

App.propTypes = {
  initialized: t.bool,
  loggedIn: t.bool,
  loginProps: t.object,
  timedOut: t.bool,
  serverError: t.object,
};
