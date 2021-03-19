import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from '@reactive-service/react';
import './style/index.css';
import App from './component/App';
import reportWebVitals from './reportWebVitals';
import AppService from './service/app.service';

const providers = [AppService];
ReactDOM.render(
  <React.StrictMode>
    <Provider providers={providers}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
