import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { secretprint, initConfig, config, API } from './printsecret';



class App extends Component {
  render() {
    return (
      <div className="App">
        {initConfig(secretprint)}
        {console.log("env", process.env.NODE_ENV)}
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          Tos get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <span>current env: {" " + process.env.NODE_ENV}</span>
        <span> key: {" " + process.env.REACT_APP_KEY}</span>
        <button onClick={() => console.log("from app, printing config stuff: ", config, API)}>print secret</button>
      </div>
    );
  }
}

export default App;
