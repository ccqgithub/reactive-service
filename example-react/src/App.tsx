import React from 'react';
import {
  BrowserRouter as Router
} from "react-router-dom";
import { ServiceProvider } from '@reactive-service/react';

import AppService from './service/app.service';
import MessageService from './service/message.service';
import TodosService from './service/todos.service';
import logo from './logo.svg';
import './App.css';


function App() {
  return (
    <Router>
      <ServiceProvider providers={[AppService, MessageService, TodosService]}>
        <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <div>

            </div>
          </header>
        </div>
      </ServiceProvider>
    </Router>
  );
}

export default App;
