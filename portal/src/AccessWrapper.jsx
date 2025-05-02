import { useEffect, useState } from 'react';
import { updateUser } from '@kineticdata/react';
import { Error } from './components/states/Error.jsx';
import { Loading } from './components/states/Loading.jsx';
import { getAttributeValue } from './helpers/records.js';
import { appActions } from './helpers/state.js';

export const AccessWrapper = ({ children, profile, config }) => {
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
      updateUser({
        username: username,
        user: {
          attributesMap: {
            'Company Permission Masks': [configPermissions],
          },
        },
        include: 'attributesMap',
      }).then(({ error, user }) => {
        if (!error) {
          appActions.updateProfile(user);
        }
        setReady(true);
      });
    } else {
      setReady(true);
    }
  }, [ready, validPermissions, configPermissions, username]);

  if (!ready) return <Loading />;

  return validPermissions ? (
    children
  ) : (
    <Error error={{ message: 'User has invalid permissions.' }} />
  );
};
