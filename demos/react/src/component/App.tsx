import React, { useCallback, useEffect, useState } from 'react';
import { useService, useObservable } from '@reactive-service/react';
import AppService from '../service/app.service';
import logo from '../asset/logo.svg';
import './App.css';

function App() {
  const appService = useService(AppService);
  const loginUser = useObservable(appService.loginUser$$);
  const loading = useObservable(appService.isLogging$$);
  const [message, setMessage] = useState('');

  const login = () => {
    const username = 'random-' + new Date().getTime();
    appService.$login.next({ username, password: 'xxx' });
  }

  useEffect(() => {
    const subscription = appService.message$.subscribe({
      next: (msg: string) => setMessage(msg),
      error: (err: any) => { throw err } 
    });

    return () => {
      subscription.unsubscribe();
    }

    console.log('----');
  }, [appService.message$]);

  return (
    <div className="App">
      <header>
        <div style={{ marginBottom: '20px' }}>
          <span>user: { loginUser?.username }</span>
          <button onClick={login}>登录</button>
        </div>
        <div style={{ marginBottom: '20px' }}>
          { loading ? 'loading...' : ''}
        </div>
        <div style={{ marginBottom: '20px' }}>
          message: {message}
        </div>
      </header>
    </div>
  );
}

export default App;
