import React, { Component } from 'react';
import currentWeekNumber from 'current-week-number';
import { checkAuth, loadMonth, initUsersConfig, updateCell, setClient, tilmeld } from './spreadsheet';
import 'react-tippy/dist/tippy.css';
import { Tooltip } from 'react-tippy';
import { initConfig } from './APIConfig';
import Dropdown from 'react-dropdown'
import 'react-dropdown/style.css'
import TilmeldModal from './components/TilmeldModal/';
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
    this.updateData = this.updateData.bind(this);
  }

  componentDidMount() {
    initConfig(window.gapi.load('client', () => {
      setClient(loadMonth(this.onLoad.bind(this), this.state.uge, new Date().getFullYear()));
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

      //console.log(authResult);
      initUsersConfig(authResult, this.LoadUser.bind(this));
      // following load might have to happen only after udate to sheet
      loadMonth(this.onLoad.bind(this), this.state.uge, new Date().getFullYear());
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
            {this.state.dage.filter(dag => Number(dag.uge) === this.state.uge).map((dag, i) => {
              return (
                <div key={i} className={`${dag.kok ? "day-list_item" : "day-list_item-ingen-madklub"}`}>
                  <h2 >{dag.ugedag} {dag.dato}</h2>
                  <span className="madklub" title="">{dag.kok || "Ingen madklub"}</span>
                  {dag.kok && (
                    <Tooltip
                      className="tilmeldte"
                      title={dag.tilmeldte && dag.tilmeldte}
                      position="right"
                      trigger="click"
                    >
                      <span>
                        &nbsp;- tilmeldte: <span className="tilmeldte-clickable">{dag.tilmeldte && dag.antalTilmeldte}</span>
                      </span>
                    </Tooltip>
                  )}
                  {dag.kok && this.state.værelsesnr && this.renderTilmeld(dag)}
                </div>
              );
            })}
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


  renderTilmeld(dag) {
    if (this.checkTilmelding(this.state.værelsesnr, dag)) {
      return (<button className="btn" onClick={() => this.tilmeld(this.state.værelsesnr, "", dag.dato)}>Afmeld</button>)
    }
    else
      return (dag.kok && <TilmeldModal onTilmeld={(value, participants) => this.tilmeld(value, participants, dag.dato)} roomNr={this.state.værelsesnr} />)
  }

  checkTilmelding(nr, dag) {
    var isTrue = false;
    dag.tilmeldte.forEach(værelse => {
      if (Number(værelse) === Number(nr)) isTrue = true;
      if (værelse.toString().includes(" ")) if (værelse.toString().split(" ")[0] === nr.toString()) isTrue = true;
    });
    return isTrue;
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
    if (this.state.authenticated) loadMonth(this.onLoad.bind(this), this.state.uge, new Date().getFullYear());
    else checkAuth(true, (result) => { this.handleAuth(result); loadMonth(this.onLoad.bind(this), this.state.uge, new Date().getFullYear()); });
  }

  tilmeld(roomNr, participants, dato) {
    var date = new Date(new Date().getFullYear(), 0, (1 + (this.state.uge - 1) * 7));
    date.setDate(dato.split('.')[0]);
    if (this.state.authenticated) tilmeld(roomNr, this.state.uge, date, participants, () => setClient(loadMonth(this.onLoad.bind(this), this.state.uge, new Date().getFullYear())), error => console.log("Error tilmelding", error));
    else checkAuth(false, (result) => {
      this.handleAuth(result);
      tilmeld(roomNr, this.state.uge, date, participants, () => setClient(loadMonth(this.onLoad.bind(this), this.state.uge, new Date().getFullYear())), error => console.log("Error tilmelding", error));
    });
  }
}

export default App;

