import React from 'react';
import ReactModal from 'react-modal';
import Dropdown from 'react-dropdown'
import 'react-dropdown/style.css'
import "./tilmeldModal_style.css";

const options = [
    "317", "318", "319", "320", "321", "322", "323", "324", "325", "326", "327", "328", "329", "330", "331"
];

export default class TilmeldModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
            value: options[0]
        };

        this.handleOpenModal = this.handleOpenModal.bind(this);
        this.handleCloseModel = this.handleCloseModel.bind(this);
        this.onSelect = this.onSelect.bind(this);
        this.onTilmeld = this.onTilmeld.bind(this);
    }

    handleOpenModal() {
        this.setState({ showModal: true });
    }

    handleCloseModel() {
        this.setState({ showModal: false });
    }

    onSelect(e) {
        this.setState({ value: e.value });
    }

    onTilmeld() {
        this.props.onTilmeld(this.state.value);
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
                            <Dropdown options={options} onChange={this.onSelect} value={options[0]} className="modal-dropdown"/>
                            </label>
                            <button btn="btn" onClick={this.onTilmeld}>Tilmeld</button>
                        </div>
                    </ReactModal>
            </div>
        );
    }
}