import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import '@toast-ui/editor/dist/toastui-editor.css';
import './assets/styles/index.css';
import ReactDOM from 'react-dom/client';
import { KineticLib } from '@kineticdata/react';
import { App } from './App.jsx';
import { HashRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux.js';

const globals = import('./components/kinetic-form/globals.jsx');

ReactDOM.createRoot(document.getElementById('root')).render(
  // Kinetic connection layer
  <Provider store={store}>
    <KineticLib globals={globals} locale="en">
      {kineticProps => (
        <HashRouter>
          <App {...kineticProps} />
        </HashRouter>
      )}
    </KineticLib>
  </Provider>,
);
