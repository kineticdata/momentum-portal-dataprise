import { useLocation } from 'react-router-dom';
import { useCallback, useEffect } from 'react';

/**
 *
 * @param {Function} callback - Function to call when the route changes, with
 *  the new pathname provided as a parameter to the function
 * @param {*[]} [dependencies] - Dependency array for the `callback` function
 */
const useRouteChange = (callback, dependencies = []) => {
  const { pathname } = useLocation();

  const fn = useCallback(callback, dependencies);

  useEffect(() => {
    fn(pathname);
  }, [pathname, fn]);
};

export default useRouteChange;
