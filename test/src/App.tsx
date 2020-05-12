import React from 'react';
import logo from './logo.svg';
import './App.css';
import Toolbar from './components/Toolbar';
import MessagesTable from './components/MessagesTable';
import MessageView from './components/MessageView';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
      </header>
      <main>
        <Toolbar />
        <MessagesTable  />
        <MessageView/>
        <Toolbar />
      </main>
    </div>
  );
}

export default App;
