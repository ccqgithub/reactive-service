import React from 'react';
import { useBehavior } from '@reactive-service/react';
import { Form } from '@reactive-service/form';
import './App.css';
import { BehaviorSubject } from 'rxjs';

type Data = {
  username: string;
};

const form = new Form<Data>(
  (data) => {
    return {
      username: {
        type: 'string',
        ruleValue: data.username,
        rules: [{ required: true }]
      }
    };
  },
  {
    username: ''
  }
);

function App() {
  console.log(form.$$.fields, form.$$.fields instanceof BehaviorSubject);
  const fields = useBehavior(form.$$.fields);
  const data = useBehavior(form.$$.data);
  console.log(data);
  return (
    <div className="App">
      <form>
        <div>
          <label>Username</label>
          <input
            type="text"
            value={data.username}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              fields.username.onChange(e.target.value);
            }}
          />
        </div>
      </form>
    </div>
  );
}

export default App;
