import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import './index.less';
import "@chatui/core/dist/index.css";
// import App from './app';
import WebSocketDemo from './WebSocketDemo'

ReactDOM.render(
  <BrowserRouter>
    <WebSocketDemo />
  </BrowserRouter>,
  document.getElementById('root'),
);
