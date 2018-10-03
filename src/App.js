import React, { Component } from 'react';
import currentWeekNumber from 'current-week-number';
import { checkAuth, load, updateCell, loadClient } from './spreadsheet';
import 'react-tippy/dist/tippy.css';
import { secretprint, initConfig } from './printsecret';
import Dropdown from 'react-dropdown'
import 'react-dropdown/style.css'
import DagComponent from './components/DagComponent';


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
      værelsesnr: undefined
    }
    this.OnNextWeekPressed = this.OnNextWeekPressed.bind(this);
    this.onPreviousWeekPressed = this.onPreviousWeekPressed.bind(this);
    this.updateData = this.updateData.bind(this);
    this.onLoad = this.onLoad.bind(this);
  }

  componentDidMount() {
    window.gapi.load('client', () => {
      loadClient(load(this.onLoad.bind(this), this.state.uge, new Date().getFullYear()));
      checkAuth(true, this.handleAuth.bind(this));
    });
    initConfig(secretprint);
  }

  /**
   * Check user authenification status and set app state accordingly
   */
  handleAuth(authResult) {
    if (authResult && !authResult.error) {
      this.setState({
        authenticated: true
      }, () => console.log("authenticated.."));
      // following load might have to happen only after udate to sheet
      load(this.onLoad.bind(this), this.state.uge, new Date().getFullYear());
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

  /**
   * Request Google authentification
   */
  authenticate(e) {
    e.preventDefault();
    if (this.state.authenticated) this.insertTest();// add update sheet
    else checkAuth(false, (result) => { this.handleAuth(result); this.insertTest() });
  }

  updateData() {
    if (this.state.authenticated) load(this.onLoad.bind(this), this.state.uge, new Date().getFullYear());
    else checkAuth(false, (result) => { this.handleAuth(result); load(this.onLoad.bind(this), this.state.uge, new Date().getFullYear()); });
  }

  insertTest() {
    updateCell('C', 2, "test", () => console.log("Done"), (error) => {
      console.log("error while inserting", error);
    })
  }


}

export default App;

