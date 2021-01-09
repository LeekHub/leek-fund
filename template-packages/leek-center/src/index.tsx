import './index.less';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

import { postMessage } from './utils/common';
import { setupBackgroundManagement } from './services/background';

ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById('root'),
  () => {
    setupBackgroundManagement();
    postMessage('pageReady');
  }
);
