import React from 'react';
import ReactModal from 'react-modal';
import Dropdown from 'react-dropdown'
import 'react-dropdown/style.css'
import "./tilmeldModal_style.css";

const rooms = [
    "317", "318", "319", "320", "321", "322", "323", "324", "325", "326", "327", "328", "329", "330", "331"
];

const participants = [ "0", "1", "2", "3", "4", "5", "6" ];

ReactModal.setAppElement('#root')

export default class TilmeldModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
            value: this.props.roomNr || rooms[0],
            participants: "1",
        };

        this.handleOpenModal = this.handleOpenModal.bind(this);
        this.handleCloseModel = this.handleCloseModel.bind(this);
        this.onRoomSelect = this.onRoomSelect.bind(this);
        this.onParticipantSelect = this.onParticipantSelect.bind(this);
        this.onTilmeld = this.onTilmeld.bind(this);
    }

    componentDidUpdate(prevprops) {
        if (prevprops.roomNr !== this.props.roomNr) {
            this.setState({ value: this.props.roomNr });
        }
    }

    handleOpenModal() {
        this.setState({ showModal: true });
    }

    handleCloseModel() {
        this.setState({ showModal: false });
    }

    onRoomSelect(e) {
        this.setState({ value: e.value });
    }

    onParticipantSelect(e) {
        this.setState({ participants: e.value });
    }

    onTilmeld() {
        this.props.onTilmeld(this.state.value, this.state.participants);
        this.handleCloseModel();
    }

    render() {
        return (
            <div>
                <button className="btn" onClick={this.handleOpenModal}>Tilmeld</button>
                <ReactModal
                    isOpen={this.state.showModal}
                    className="Modal"
                    overlayClassName="Overlay"
                    contentLabel="Modal">
                        <div className="modal-rightHeader">
                            <button onClick={this.handleCloseModel} className="modal-closeBottom">X</button>
                        </div>
                        <br />
                        <div className="modal-content">
                            <label><h3>Værelses nummber:</h3>
                                <Dropdown options={rooms} onChange={this.onRoomSelect} value={this.state.value} className="modal-dropdown"/>
                            </label>
                            <label><h3>Antal:</h3>
                                <Dropdown options={participants} onChange={this.onParticipantSelect} value={this.state.participants} className="modal-dropdown"/>
                            </label>
                            <button btn="btn" onClick={this.onTilmeld}>Tilmeld</button>
                        </div>
                    </ReactModal>
            </div>
        );
    }
}