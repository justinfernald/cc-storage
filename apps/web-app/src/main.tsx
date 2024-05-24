import './index.css';
// or using a ESM bundler which resolves CSS files as modules:
import '@blueprintjs/core/lib/css/blueprint.css';
// include blueprint-icons.css for icon font support
import '@blueprintjs/icons/lib/css/blueprint-icons.css';

import React from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('No root element found');
const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
