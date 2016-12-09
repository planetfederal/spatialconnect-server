import React, { Component, PropTypes } from 'react';
import '../style/FormDetails.less';

const AddFieldControl = ({ text, onClick, options }) => (
  <button className="btn btn-sc" onClick={() => onClick(options)}>{text}</button>
);

AddFieldControl.propTypes = {
  text: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  options: PropTypes.object.isRequired,
};

class FormControls extends Component {

  constructor(props) {
    super(props);
    this.addField = this.addField.bind(this);
  }

  addField(options) {
    this.props.addField({
      form_key: this.props.form.form_key,
      field_key: '',
      field_label: '',
      options,
    });
  }

  render() {
    return (
      <div className="form-controls form-pane">
        <div className="form-pane-title"><h5>Add Fields</h5></div>
        <div className="form-pane-wrapper">
          <AddFieldControl
            text="Text"
            onClick={this.addField}
            options={{ type: 'string', pattern: '' }}
          />
          <AddFieldControl
            text="Number"
            onClick={this.addField}
            options={{ type: 'number', integer: false }}
          />
          <AddFieldControl
            text="Yes/No"
            onClick={this.addField}
            options={{ type: 'boolean' }}
          />
          <AddFieldControl
            text="Date"
            onClick={this.addField}
            options={{ type: 'date' }}
          />
          <AddFieldControl
            text="Slider"
            onClick={this.addField}
            options={{ type: 'slider' }}
          />
          <AddFieldControl
            text="Counter"
            onClick={this.addField}
            options={{ type: 'counter' }}
          />
          <AddFieldControl
            text="Select"
            onClick={this.addField}
            options={{ type: 'select', options: [] }}
          />
          <AddFieldControl
            text="Photo"
            onClick={this.addField}
            options={{ type: 'photo', pattern: '' }}
          />
        </div>
      </div>
    );
  }
}

FormControls.propTypes = {
  form: PropTypes.object.isRequired,
  addField: PropTypes.func.isRequired,
};

export default FormControls;
