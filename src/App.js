import React, { Component } from 'react';
import currentWeekNumber from 'current-week-number';
import { checkAuth, load, updateCell, loadClient } from './spreadsheet';
import 'react-tippy/dist/tippy.css';
import { Tooltip } from 'react-tippy';
import { secretprint, initConfig, config, API } from './printsecret';


class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      days: [],
      random: {},
      authors: [],
      author: '',
      order: 'date',
      authenticated: false,
      uge: currentWeekNumber()
    }
  }

  componentDidMount() {
    window.gapi.load('client', () => {
      loadClient(load(this.onLoad.bind(this)));
      checkAuth(true, this.handleAuth.bind(this));
    });
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
      load(this.onLoad.bind(this));
    } else {
      console.log("auth failed?");
      this.setState({
        authenticated: false
      })
    }
  }

  /**
   * Once quotes have been loaded from the spreadsheet
   */
  onLoad(data, error) {
    if (data) {
      this.setState({
        days: data
      });
    }
    else {
      this.setState({
        error: error
      })
    }
  }

  render() {
    return (
      <div className="app">
        {initConfig(secretprint)}
        {console.log("env", process.env.NODE_ENV)}
        <h1 className="brand">Madklub Quick</h1>
        <button onClick={() => this.insertTest()} className="btn"> test insert</button>
        <button onClick={() => console.log("from app, printing config stuff: ", config, API)}>print secret</button>
        {this.renderContent()}
      </div>
    );
  }

  renderContent() {

    if (this.state.days.length) {
      console.log("if render 2");
      return (
        <div className="page">
          <div className="nav-header">
            <button className="btn" onClick={() => {
              this.setState({ uge: this.state.uge - 1 });
            }}>Forrige uge</button>

            <span>Uge {this.state.uge}</span>

            <button className="btn" onClick={() => {
              this.setState({ uge: this.state.uge + 1 });
            }}>Næste uge</button>
          </div>

          <div className="days">
            {this.state.days.filter(day => Number(day.uge) === this.state.uge).map((day, i) => {
              return (
                <div key={i} className={`${day.kok ? "day-list_item" : "day-list_item-ingen-madklub"}`}>
                  <h2 >{day.ugedag} {day.dato}</h2>
                  <span className="madklub" title="">{day.kok || "Ingen madklub"}</span>
                  {day.kok && (
                    <Tooltip
                      className="tilmeldte"
                      title={day.tilmeldte && day.tilmeldte}
                      position="right"
                      trigger="click"
                    >
                      <span>
                        {` - tilmeldte: ${day.tilmeldte && day.antalTilmeldte}`}
                      </span>
                    </Tooltip>
                  )}
                  {day.kok &&
                    (<button className="btn" onClick={this.authenticate.bind(this)}>Tilmeld</button>)}
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    else if (this.state.error) {
      console.log("if render 3");
      console.log(this.state.error);
      return (
        <div> {this.state.error}</div>
      );
    }
    else {
      console.log("if render 4");
      console.log("why is loader running? days lenght:", this.state.days);
      return (
        <div className="loader" />
      );
    }
  }

  /**
   * Request Google authentification
   */
  authenticate(e) {
    e.preventDefault();
    if (this.state.authenticated) this.insertTest(); // add update sheet
    else checkAuth(false, () => { this.handleAuth.bind(this); this.insertTest(); });
  }

  insertTest() {
    updateCell('A', 2, "test", null, (error) => {
      console.log("error while inserting", error);
    })
  }


}

export default App;

