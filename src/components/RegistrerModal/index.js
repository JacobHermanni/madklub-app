import React from 'react';
import ReactModal from 'react-modal';
import Dropdown from 'react-dropdown'
import 'react-dropdown/style.css'
import "./registrerModal_style.css";
import { updateCell } from '../../spreadsheet';

const rooms = [
    "317", "318", "319", "320", "321", "322", "323", "324", "325", "326", "327", "328", "329", "330", "331"
];

ReactModal.setAppElement('#root')

export default class RegistrerModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            værelsesnr: this.props.user.værelsesnr,
            navn: this.props.user.navn || "",
            showModal: this.props.showModal || false
        };

        this.handleOpenModal = this.handleOpenModal.bind(this);
        this.handleCloseModel = this.handleCloseModel.bind(this);
        this.onRoomSelect = this.onRoomSelect.bind(this);
        this.onGem = this.onGem.bind(this);
    }

    componentDidUpdate(prevprops) {
        if (prevprops.user.værelsesnr !== this.props.user.værelsesnr) {
            this.setState({ værelsesnr: this.props.user.værelsesnr });
        }
    }


    handleOpenModal() {
        this.setState({ showModal: true });
    }

    handleCloseModel() {
        this.setState({ showModal: false });
    }

    onRoomSelect(e) {
        this.setState({ værelsesnr: e.value });
    }

    onGem() {
        this.props.onGem(this.state.værelsesnr, this.state.navn);
        this.handleCloseModel();

        // row nr is - 316 for room number and +1 for column header in sheet
        updateCell('b', this.state.værelsesnr - 315, this.state.navn);
        updateCell('c', this.state.værelsesnr - 315, this.props.user.email);
    }

    render() {
        return (
            <div>
                <button className="modal_btn btn" onClick={this.handleOpenModal}>Gem bruger</button>
                <ReactModal
                    isOpen={this.state.showModal}
                    className="Modal day-list_item"
                    overlayClassName="Overlay"
                    contentLabel="Modal">
                    <div className="modal-rightHeader">
                        <button onClick={this.handleCloseModel} className="modal-closeBottom">X</button>
                    </div>
                    <div className="modal-content">
                        <label><h4>Registrer dit navn og værelsesnummer med denne mail</h4></label>
                        <label><h3>Værelsesnummer:</h3>
                            <Dropdown options={rooms} onChange={this.onRoomSelect} value={this.state.værelsesnr || "Vælg værelse"} className="modal-dropdown" />
                        </label>
                        <label><h3>Navn</h3>
                            <input className="modal-input" onChange={(event) => this.setState({ navn: event.target.value })} value={this.state.navn}></input>
                        </label>
                        <button className="btn" onClick={this.onGem}>Gem bruger</button>
                    </div>
                </ReactModal>
            </div>
        );
    }
}