import React from 'react';
import { Tooltip } from 'react-tippy';
import TilmeldModal from './TilmeldModal';
import { checkAuth, loadMonth, setClient, tilmeld } from '../spreadsheet';
import Loader from 'react-spinners/ScaleLoader';


export default class DagComponent extends React.Component {
    constructor(props) {
        super(props);
        const expandable = this.props.dag.beskrivelse || this.props.dag.lukker || this.props.dag.kuvertpris !== "0,0" ? true : false;
        this.state = {
            expanded: false,
            expandable: expandable,
            loading: false,
            alleBrugere: this.props.alleBrugere
        };
    }

    componentDidUpdate(prevprops) {
        if (prevprops !== this.props) {
            const expandable = this.props.dag.beskrivelse || this.props.dag.lukker || this.props.dag.kuvertpris !== "0,0" ? true : false;
            this.setState({ expanded: false, expandable });
        }
    }

    render() {
        var title = [];
        if (this.props.alleBrugere && Number(this.props.dag.antalTilmeldte) > 0) {
            title = this.props.alleBrugere.getUserNames(this.props.dag.tilmeldte);
        } else {
            title = this.props.dag.tilmeldte && this.props.dag.tilmeldte;
        }
        return (
            <div className={`${this.props.dag.kok ? "day-list_item" : "day-list_item-ingen-madklub"}`}>
                <h2 >{this.props.dag.ugedag} {this.props.dag.dato}</h2>
                <span className="madklub" title="">{this.props.dag.kok || "Ingen madklub"}</span>
                {this.props.dag.kok && (
                    <Tooltip
                        className="tilmeldte"
                        title={title}
                        position="right"
                        trigger="click"
                    >
                        <span>
                            &nbsp;- tilmeldte: <span className="clickable">{this.props.dag.tilmeldte && this.props.dag.antalTilmeldte}</span>
                        </span>
                    </Tooltip>
                )}
                <br />
                {this.props.dag.kok && this.props.værelsesnr && this.renderTilmeld(this.props.dag)}
                {this.props.dag.kok &&
                    (<div>
                        <span>Veggie: {this.props.dag.veggie}</span>
                    </div>)
                }
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
                        {this.props.dag.lukker.toLowerCase() === "lukket"
                            ? (<span>Lukket</span>)
                            : (<span>Lukker kl. {this.props.dag.lukker}</span>)}
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
        if (this.state.loading) return <Loader height={41} color="#4285f4" />
        else if (this.checkTilmelding(this.props.værelsesnr, dag)) {
            return (<button className="btn" onClick={() => this.tilmeld(this.props.værelsesnr, "", dag.dato, dag.row)}>Afmeld</button>)
        }
        else
            return (dag.kok && <TilmeldModal onTilmeld={(value, participants) => this.tilmeld(value, participants, dag.dato, dag.row)} roomNr={this.props.værelsesnr} />)
    }

    checkTilmelding(nr, dag) {
        var isTrue = false;
        dag.tilmeldte.forEach(værelse => {
            if (Number(værelse) === Number(nr)) isTrue = true;
            if (værelse.toString().includes(" ")) if (værelse.toString().split(" ")[0] === nr.toString()) isTrue = true;
        });
        return isTrue;
    }

    tilmeld(roomNr, participants, dato, row) {
        var date = new Date(new Date().getFullYear(), 0, (1 + (this.props.uge - 1) * 7));

        date.setDate(dato.split('.')[0]);

        // change year if looking into next year or into prev year
        if (date.getMonth() === 0 && new Date().getMonth() === 11) {
            date.setFullYear(date.getFullYear() + 1)
        } else if (date.getMonth() === 11 && new Date().getMonth() === 0) {
            date.setFullYear(date.getFullYear() - 1)
        }

        this.setState({ loading: true });

        // onLoad will get called from the loadMonth function with the additional response data below
        const onLoad = (response) => this.setState({ loading: false, expanded: this.state.expanded }, this.props.onLoad(response));

        var week = this.props.uge;
        if (this.props.overrideMonth) { week = week + 1; }

        if (this.props.authenticated) {
            tilmeld(roomNr, week, date, row, participants,
                setClient(loadMonth(onLoad, week, date.getFullYear())),
                error => console.log("Error tilmelding", error));
        } else checkAuth(false, (result) => {
            this.handleAuth(result);
            tilmeld(roomNr, week, date, participants,
                setClient(loadMonth(onLoad, week, date.getFullYear())),
                error => console.log("Error tilmelding", error));
        });
    }
}