import React, { Component } from 'react';
import currentWeekNumber from 'current-week-number';
import { initConfig } from './APIConfig';
import 'react-dropdown/style.css'
import DagComponent from './components/DagComponent';
import { checkAuth, loadMonth, initUsersConfig, setClient } from './spreadsheet';
import 'react-tippy/dist/tippy.css';
import Dropdown from 'react-dropdown'
import RegistrerModal from './components/RegistrerModal';


const options = [
  '317', '318', '319', '320', '321', '322', '323', '324', '325', '326', '327', '328', '329', '330', '331'
];

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      dage: undefined,
      authenticated: false,
      uge: currentWeekNumber(),
      værelsesnr: undefined,
      navn: undefined
    }
    this.OnNextWeekPressed = this.OnNextWeekPressed.bind(this);
    this.onPreviousWeekPressed = this.onPreviousWeekPressed.bind(this);
    this.handleAuth = this.handleAuth.bind(this);
    this.updateData = this.updateData.bind(this);
    this.onLoad = this.onLoad.bind(this);
  }

  componentDidMount() {
    initConfig(window.gapi.load('client', () => {
      setClient(loadMonth(this.onLoad, this.state.uge, new Date().getFullYear()));
      checkAuth(true, this.handleAuth.bind(this));
    }));
  }

  /**
   * Check user authenification status and set app state accordingly
   */
  handleAuth(authResult) {
    if (authResult && !authResult.error) {
      this.setState({
        authenticated: true
      }, () => console.log("authenticated.."));
      initUsersConfig(authResult, this.LoadUser.bind(this));
      // following load might have to happen only after udate to sheet
      loadMonth(this.onLoad, this.state.uge, new Date().getFullYear());
    } else {
      console.log("auth failed?", authResult.error);
      this.setState({
        authenticated: false
      })
    }
  }

  onLoad(data, error) {
    if (data) {
      this.setState({
        dage: data
      });
    }
    else if (error) {
      console.error(error);
      this.setState({
        error: error.message
      });
    }
  }

  LoadUser(user, isRegistered) {
    if (isRegistered) {
      this.setState({ værelsesnr: user.værelsesnr, navn: user.navn });
    }
    else {
      this.setState({ showRegister: true, værelsesnr: user.værelsesnr, navn: user.navn, email: user.email });
    }
  }

  render() {
    return (
      <div className="app">
        <h1 className="brand">Madklub Quick</h1>
        <div className="room-number">
          <Dropdown className="room-dropdown"
            options={options}
            value={this.state.værelsesnr || "Vælg dit nr"}
            onChange={(option) => this.setState({ værelsesnr: option.value })}
          />
          {!this.state.authenticated && this.state.dage &&
            (<button className="btn" onClick={() => checkAuth(false, this.handleAuth.bind(this))}>Log ind</button>)}

          {this.state.navn && (<div>Logget ind som {this.state.navn}</div>)}

          {this.state.authenticated && this.state.showRegister &&
            (<RegistrerModal
              user={{ værelsesnr: this.state.værelsesnr, navn: this.state.navn, email: this.state.email }}
              onGem={(værelsesnr, navn) => this.setState({ showRegister: false, værelsesnr, navn })}
            />
            )}

        </div>
        {this.renderContent()}
      </div>
    );
  }

  renderContent() {
    if (this.state.dage) {
      return (
        <div className="page">
          <div className="nav-header">
            <button className="btn" onClick={this.onPreviousWeekPressed}>{"<<"}</button>

            <ul>
              <li>Uge {this.state.uge}</li>
              {this.state.dage.find(dag => Number(dag.uge) === Number(this.state.uge)) &&
                (
                  <li>Ugens kokke:
                <br></br> {this.state.dage.find(dag => Number(dag.uge) === Number(this.state.uge)).ugensKokke.toString()}
                  </li>
                )}
            </ul>
            <button className="btn" onClick={this.OnNextWeekPressed}>{">>"}</button>
          </div>

          <div className="days">
            {this.state.dage.filter(dag => Number(dag.uge) === this.state.uge).map((dag, i) =>
              <DagComponent key={i}
                dag={dag}
                værelsesnr={this.state.værelsesnr}
                uge={this.state.uge}
                authenticated={this.state.authenticated}
                onLoad={this.onLoad}
              />
            )}
          </div>
        </div >
      );
    }
    else if (this.state.error) {
      console.log("(error)", this.state.error);
      return (
        <div> {this.state.error}</div>
      );
    }
    else {
      console.log("(loading)");
      return (
        <div className="loader" />
      );
    }
  }

  OnNextWeekPressed() {
    this.setState({ uge: this.state.uge + 1 }, () => {
      this.updateData();
    });
  }

  onPreviousWeekPressed() {
    this.setState({ uge: this.state.uge - 1 }, () => {
      this.updateData();
    })
  }

  updateData() {
    if (this.state.authenticated) {
      loadMonth(this.onLoad, this.state.uge, new Date().getFullYear());
    } else {
      checkAuth(true, (result) => { 
        this.handleAuth(result); 
        loadMonth(this.onLoad, this.state.uge, new Date().getFullYear()); 
      });
    }
  }
}

export default App;

