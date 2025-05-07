import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import t from 'prop-types';
import {
  registerWidget,
  validateContainer,
  validateField,
  WidgetAPI,
} from './index.js';
import { Modal } from '../../../atoms/Modal.jsx';
import { ThemeBuilder, ThemePreview } from '../../../pages/theme/index.jsx';
import { Provider } from 'react-redux';
import { store } from '../../../redux.js';

/**
 * @param {ThemeWidgetConfig} props
 * @param {Object} props.field Kinetic field object
 */
const ThemeComponent = forwardRef(
  ({ field, destroy, disabled, label }, ref) => {
    const [open, setOpen] = useState(false);

    const getTheme = useCallback(() => {
      let theme = {};
      try {
        if (field.value()) {
          theme = JSON.parse(field.value());
        }
      } catch (e) {
        // Do nothing
      }
      return theme;
    }, [field]);

    const [themeData, setThemeData] = useState(getTheme());

    // Change handler fore the editor to have it update the Kinetic field
    const setTheme = useCallback(theme => {
      setThemeData(typeof theme === 'object' ? theme : {});
    }, []);

    useEffect(() => {
      field.value(JSON.stringify(themeData));
    }, [field, themeData]);

    // Define API ref
    const api = useRef({ getTheme, setTheme });
    // Update API ref when its contents change
    useEffect(() => {
      Object.assign(api.current, { getTheme, setTheme });
    }, [getTheme, setTheme]);

    return (
      <WidgetAPI ref={ref} api={api.current}>
        <div className="field">
          {label && <label>{label}</label>}
          <ThemePreview
            themeData={themeData}
            onEdit={() => setOpen(true)}
            disabled={disabled}
          />
        </div>
        <Modal
          open={open}
          onOpenChange={({ open }) => setOpen(open)}
          title="Edit Theme"
          size="xl"
        >
          <div slot="body" className="h-full">
            <ThemeBuilder
              themeData={themeData}
              updateThemeData={setTheme}
              onSave={() => setOpen(false)}
            />
          </div>
        </Modal>
      </WidgetAPI>
    );
  },
);

ThemeComponent.propTypes = {
  className: t.string,
  disabled: t.bool,
  field: t.object.isRequired,
  editorProps: t.object,
};

const ThemeProvider = forwardRef((props, ref) => (
  <Provider store={store}>
    <ThemeComponent {...props} ref={ref} />
  </Provider>
));

/**
 * Function that initializes a Theme widget. This function validates the
 * provided parameters, and then registers the widget, which will create an
 * instance of the widget and render it into the provided container.
 *
 * @param {HTMLElement} container HTML Element into which to render the widget.
 * @param {Object} field Kinetic text field with 2 or more rows.
 * @param {ThemeWidgetConfig} config Configuration object for the widget.
 * @param {string} [id] Optional id that can be used to retrieve a reference to
 *  the widget's API functions using the `Theme.get` function.
 */
export const Theme = ({ container, field, config, id } = {}) => {
  if (
    validateContainer(container, 'Theme') &&
    validateField(field, 'text', 'Theme')
  ) {
    return registerWidget(Theme, {
      container,
      Component: ThemeProvider,
      props: { ...config, field },
      id,
    });
  }
  return Promise.reject(
    'The Theme widget parameters are invalid. See the console for more details.',
  );
};

/**
 * @typedef {Object} ThemeWidgetConfig
 */
