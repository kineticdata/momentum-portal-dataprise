import { useCallback, useEffect, useMemo, useState } from 'react';
import { callIfFn } from './index.js';
import { useDeepCompareCallback, useDeepCompareMemo } from 'use-deep-compare';

const initialState = {
  // Has the data been retrieved
  initialized: false,
  // Is the data being retrieved
  loading: false,
  // Error response
  error: null,
  // Response data, transformed if applicable
  data: null,
  // Timestamp of last fetch to prevent earlier fetches from updating state if
  // multiple simultaneous fetches are triggered
  lastFetch: null,
};

/**
 * Retrieves a single record of data and returns relevant data and meta
 * properties, as well as actions for reloading and updating the item.
 *
 * @param {Function} apiFunction - A Kinetic API function for fetching a data
 *  record.
 * @param {*[]} [parameters] - An array of parameters that will be passed into
 *  the `apiFunction`. If falsy, the fetch will not be triggered.
 * @param {Function} [transform] - A transform function that will be called with
 *  the response from the `apiFunction` before the response is returned.
 * @returns {[DataItemState, DataItemActions]} - A state object of relevant data
 *  and an actions object of relevant functions.
 */
const useDataItem = (apiFunction, parameters, transform) => {
  // Create state for the data list
  const [state, setState] = useState(initialState);
  // Create a state update function that takes a timestamp, and only updates
  // the state if the timestamp matches the lastFetch value
  const setTimestampedState = useCallback(
    (timestamp, newState) =>
      setState(currentState => {
        if (currentState.lastFetch === timestamp) {
          return callIfFn(newState, newState, [currentState]);
        }
        return currentState;
      }),
    [],
  );

  // Memoize the provided parameters using deep compare to only trigger a
  // re-fetch when the parameter values change
  const memoizedParameters = useDeepCompareMemo(() => parameters, [parameters]);

  // Memoize the transform function because we don't expect it to change without
  // the parameters changing.
  const memoizedTransform = useDeepCompareCallback(transform, [parameters]);

  /**
   * Defines a function that will preform the data fetch based on the provided
   * `apiFunction` and `parameters`
   *
   * @param {*[]} currentParameters - The parameters to pass to the
   *  `apiFunction`.
   * @param {Object} [stateChanges] - An object of state changes that should be
   *  made when this fetch is triggered.
   */
  const fetch = useCallback(
    (currentParameters, stateChanges = {}) => {
      // Generate a timestamp so that the async call's response only updates the
      // state if no other calls were made after this one
      const timestamp = new Date().getTime();
      // Update the state to set the correct loading, initialized, and lastFetch
      // values, as well as any provided state changes
      setState(currentState => ({
        ...currentState,
        ...stateChanges,
        loading: true,
        initialized: true,
        lastFetch: timestamp,
      }));

      // Only perform the fetch if the parameters are not falsy
      if (currentParameters) {
        // Call the provided `apiFunction` with the passed in parameters
        apiFunction(...currentParameters).then(({ error, ...response }) => {
          if (error) {
            // If an error is returned, reset the state to the initial state,
            // but set initialized to true, and add the error to the state
            setTimestampedState(timestamp, {
              ...initialState,
              initialized: true,
              error,
            });
          } else {
            // If the call succeeded, set the data, transforming it if a
            // `transform` function was provided.
            setTimestampedState(timestamp, currentState => ({
              ...currentState,
              loading: false,
              data: callIfFn(memoizedTransform, response, [response]),
            }));
          }
        });
      }
    },
    [setTimestampedState, apiFunction, memoizedTransform],
  );

  /**
   * Reloads the item.
   */
  const reload = useCallback(() => {
    if (state.initialized) {
      fetch(memoizedParameters);
    }
  }, [fetch, state, memoizedParameters]);

  /**
   * Updates the data state of the item with the provided data.
   */
  const update = useCallback(data => {
    // Set the given data into a clean state object, setting initialized to
    // true and a new lastFetch value to make sure no active calls update this
    // data
    setState({
      ...initialState,
      data,
      initialized: true,
      lastFetch: new Date().getTime(),
    });
  }, []);

  // Trigger the fetch function with the provided parameters whenever the
  // parameters change, and only if they exist. If the parameters are falsy,
  // reset the state to make the item uninitialized.
  useEffect(() => {
    if (memoizedParameters) {
      fetch(memoizedParameters);
    } else {
      setState({ ...initialState });
    }
  }, [fetch, memoizedParameters]);

  /**
   * @type {DataItemState}
   */
  const returnState = useDeepCompareMemo(
    () => ({
      initialized: state.initialized,
      loading: state.loading,
      error: structuredClone(state.error),
      data: structuredClone(state.data),
    }),
    [state],
  );

  /**
   * @type {DataItemActions}
   */
  const returnActions = useMemo(() => ({ reload, update }), [reload, update]);

  return [returnState, returnActions];
};

export default useDataItem;

/**
 * @typedef {Object} DataItemState
 *  The state of the data item.
 * @property {boolean} initialized - Has the item fetch been triggered at least
 *  once.
 * @property {boolean} loading - Is the item being retrieved right now.
 * @property {Object} error - Error object returned from the `apiFunction`.
 * @property {*} data - Transformed data returned from the `apiFunction`.
 */

/**
 * @typedef {Object} DataItemActions
 *  An object of actions related to the data item.
 * @property {Function} reload - Reloads the item.
 * @property {Function} update - Updates the `data` state of DataItemState with
 *  the provided value. This can be used if you updated the item and received a
 *  response that you want to use without reloading the item.
 */
