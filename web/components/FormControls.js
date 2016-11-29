import React, { Component, PropTypes } from 'react';
import '../style/FormDetails.less';

const AddFieldControl = ({ text, onClick, options }) => (
  <button className="btn btn-sc" onClick={() => onClick(options)}>{text}</button>
);

class FormControls extends Component {

  addField(options) {
    this.props.addField({
      form_key: this.props.form.get('form_key'),
      field_key: '',
      field_label: '',
      options: options
    });
  }

  render() {
    return (
      <div className="form-controls form-pane">
        <div className="form-pane-title"><h5>Add Fields</h5></div>
        <div className="form-pane-wrapper">
          <AddFieldControl
            text="Text"
            onClick={this.addField.bind(this)}
            options={{type: 'string', pattern: ''}}
            />
          <AddFieldControl
            text="Number"
            onClick={this.addField.bind(this)}
            options={{type: 'number', integer: false}}
            />
          <AddFieldControl
            text="Yes/No"
            onClick={this.addField.bind(this)}
            options={{type: 'boolean'}}
            />
          <AddFieldControl
            text="Date"
            onClick={this.addField.bind(this)}
            options={{type: 'date'}}
            />
          <AddFieldControl
            text="Slider"
            onClick={this.addField.bind(this)}
            options={{type: 'slider'}}
            />
          <AddFieldControl
            text="Counter"
            onClick={this.addField.bind(this)}
            options={{type: 'counter'}}
            />
          <AddFieldControl
            text="Select"
            onClick={this.addField.bind(this)}
            options={{type: 'select', options: []}}
            />
          <AddFieldControl
            text="Photo"
            onClick={this.addField.bind(this)}
            options={{type: 'photo', pattern: ''}}
            />
        </div>
      </div>
    );
  }
}

FormControls.propTypes = {
  form: PropTypes.object.isRequired,
};

export default FormControls;