import './index.less';
import React from 'react';
import ReactDOM from 'react-dom';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

import { postMessage } from './utils/common';
import { setupBackgroundManagement } from './services/background';

const initialRoute = (window as any).initialRoute || '/';

ReactDOM.render(
  <MemoryRouter initialEntries={[initialRoute]}>
    <App />
  </MemoryRouter>,
  document.getElementById('root'),
  () => {
    setupBackgroundManagement();
    postMessage('pageReady');
  }
);
