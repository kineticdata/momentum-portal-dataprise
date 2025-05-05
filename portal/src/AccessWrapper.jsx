import { useEffect, useState } from 'react';
import { Error } from './components/states/Error.jsx';
import { Loading } from './components/states/Loading.jsx';
import { executeIntegration } from './helpers/api.js';
import { getAttributeValue } from './helpers/records.js';
import { appActions } from './helpers/state.js';

export const AccessWrapper = ({ children, cid, profile, config }) => {
  const username = profile?.username;

  // Has access been initialized
  const [ready, setReady] = useState(!config);

  // Get user's form permission masks
  const userPermissions = getAttributeValue(
    profile,
    'Company Permission Masks',
    null,
  );
  // Get the company's form permission masks
  const configPermissions = config?.values?.['Form Permission Mask'] || null;

  const validPermissions = userPermissions === configPermissions;

  useEffect(() => {
    if (!ready && !validPermissions) {
      // Update user's Company Permission Masks to match the config
      executeIntegration({
        kappSlug: 'service-portal',
        integrationName: 'Update User Company Permission Masks',
        parameters: { permissionMasks: configPermissions },
      }).then(({ error, user }) => {
        if (!error && user) {
          appActions.updateProfile(user);
        }
        setReady(true);
      });
    } else {
      setReady(true);
    }
  }, [ready, validPermissions, configPermissions, username]);

  if (!ready) return <Loading />;

  return !cid ? (
    <Error
      header={true}
      error={{
        message:
          'Your user record is not configured properly. Please contact an administrator.',
      }}
    />
  ) : validPermissions ? (
    children
  ) : (
    <Error
      header={true}
      error={{
        message:
          'Your user record has invalid permissions. Please reload, and if the error persists, contact an administrator.',
      }}
    />
  );
};
