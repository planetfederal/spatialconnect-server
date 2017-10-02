import React, { Component, PropTypes } from 'react';
import '../style/FormDetails.less';

class FormOptions extends Component {
  constructor(props) {
    super(props);

    this.deleteForm = this.deleteForm.bind(this);
    this.changeLabel = this.changeLabel.bind(this);
  }
  changeLabel(e) {
    this.props.updateFormName(this.props.form.form_key, e.target.value);
  }

  deleteForm() {
    this.props.deleteForm(this.props.form.form_key);
  }

  render() {
    const { form } = this.props;
    return (
      <div className="form-options form-pane">
        <div className="form-pane-title"><h5>Form Options</h5></div>
        <div className="form-pane-wrapper">
          <div className="form-group">
            <label htmlFor="exampleInputEmail1">Form name</label>
            <input
              type="text"
              className="form-control"
              value={form.form_label}
              onChange={this.changeLabel}
            />
          </div>
          <button className="btn btn-danger" onClick={this.deleteForm}>
            Delete Form
          </button>
        </div>
      </div>
    );
  }
}

FormOptions.propTypes = {
  form: PropTypes.object.isRequired,
  updateFormName: PropTypes.func.isRequired,
  deleteForm: PropTypes.func.isRequired,
};

export default FormOptions;
