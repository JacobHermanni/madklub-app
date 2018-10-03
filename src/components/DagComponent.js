import React from 'react';
import { Tooltip } from 'react-tippy';
import TilmeldModal from './TilmeldModal';
import { checkAuth, load, loadClient, tilmeld } from '../spreadsheet';


export default class DagComponent extends React.Component {
    constructor(props) {
        super(props);
        const expandable = this.props.dag.beskrivelse || this.props.dag.lukker ? true : false;
        this.state = {
            expanded: false,
            expandable: expandable
        };
    }

    render() {
        return (
            <div className={`${this.props.dag.kok ? "day-list_item" : "day-list_item-ingen-madklub"}`}>
                <h2 >{this.props.dag.ugedag} {this.props.dag.dato}</h2>
                <span className="madklub" title="">{this.props.dag.kok || "Ingen madklub"}</span>
                {this.props.dag.kok && (
                    <Tooltip
                        className="tilmeldte"
                        title={this.props.dag.tilmeldte && this.props.dag.tilmeldte}
                        position="right"
                        trigger="click"
                    >
                        <span>
                            &nbsp;- tilmeldte: <span className="clickable">{this.props.dag.tilmeldte && this.props.dag.antalTilmeldte}</span>
                        </span>
                    </Tooltip>
                )}
                {this.props.dag.kok && this.props.værelsesnr && this.renderTilmeld(this.props.dag)}
                {this.state.expanded && this.renderExpanded()}
                {this.props.dag.kok && this.state.expandable &&
                    (<div className="clickable dagcomponent-toggle-expand" onClick={() => this.toggleExpand()}>
                        {!this.state.expanded ? "\u225A" : "\u2259"}
                    </div>)}
            </div>
        );
    }

    renderExpanded() {
        return (
            <div>
                {this.props.dag.beskrivelse && (
                    <div>
                        <span>{this.props.dag.beskrivelse}</span>
                    </div>)}
                {this.props.dag.lukker && (
                    <div>
                        <span>Lukker kl. {this.props.dag.lukker}</span>
                    </div>)}
                {this.props.dag.kuvertpris && this.props.dag.kuvertpris !== "0,0" && (
                    <div>
                        <span>Kuvertpris: {this.props.dag.kuvertpris} kr.</span>
                    </div>)}
            </div>)
    }

    toggleExpand() {
        if (this.state.expanded) this.setState({ expanded: false });
        else this.setState({ expanded: true });
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