import React from 'react';
import { Tooltip } from 'react-tippy';
import TilmeldModal from './TilmeldModal';
import { checkAuth, load, loadClient, tilmeld } from '../spreadsheet';


export default class DagComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            blabla: ""
        };
    }

    render() {//key={this.props.index}
        return (
            <div  className={`${this.props.dag.kok ? "day-list_item" : "day-list_item-ingen-madklub"}`}>
                <h2 >{this.props.dag.dato}</h2>
                <span className="madklub" title="">{this.props.dag.kok || "Ingen madklub"}</span>
                {this.props.dag.kok && (
                    <Tooltip
                        className="tilmeldte"
                        title={this.props.dag.tilmeldte && this.props.dag.tilmeldte}
                        position="right"
                        trigger="click"
                    >
                        <span>
                            &nbsp;- tilmeldte: <span className="tilmeldte-clickable">{this.props.dag.tilmeldte && this.props.dag.antalTilmeldte}</span>
                        </span>
                    </Tooltip>
                )}
                {this.props.dag.kok && this.props.værelsesnr && this.renderTilmeld(this.props.dag)}
            </div>
        );
    }



    renderTilmeld(dag) {
        if (this.checkTilmelding(this.props.værelsesnr, dag)) {
            return (<button className="btn" onClick={() => this.tilmeld(this.props.værelsesnr, "", dag.dato)}>Afmeld</button>)
        }
        else
            return (dag.kok && <TilmeldModal onTilmeld={(value, participants) => this.tilmeld(value, participants, dag.dato)} roomNr={this.props.værelsesnr} />)
    }

    checkTilmelding(nr, dag) {
        var isTrue = false;
        dag.tilmeldte.forEach(værelse => {
            if (Number(værelse) === Number(nr)) isTrue = true;
            if (værelse.toString().includes(" ")) if (værelse.toString().split(" ")[0] === nr.toString()) isTrue = true;
        });
        return isTrue;
    }

    tilmeld(roomNr, participants, dato) {
        var date = new Date(new Date().getFullYear(), 0, (1 + (this.props.uge - 1) * 7));
        date.setDate(dato.split('.')[0]);
        if (this.props.authenticated) tilmeld(roomNr, this.props.uge, date, participants, () => loadClient(load(this.props.onLoad, this.props.uge, new Date().getFullYear())), error => console.log("Error tilmelding", error));
        else checkAuth(false, (result) => {
            this.handleAuth(result);
            tilmeld(roomNr, this.props.uge, date, participants, () => loadClient(load(this.props.onLoad, this.props.uge, new Date().getFullYear())), error => console.log("Error tilmelding", error));
        });
    }
}