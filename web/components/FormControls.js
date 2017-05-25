import React, { Component, PropTypes } from 'react';
import '../style/FormDetails.less';

const AddFieldControl = ({ text, onClick, options }) => (
  <button className="btn btn-sc" onClick={() => onClick(options)}>
    {text}
  </button>
);

AddFieldControl.propTypes = {
  text: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  options: PropTypes.object.isRequired,
};

const fieldDefaults = fieldType => {
  const fieldConstraints = {
    string: { pattern: '' },
    number: { integer: false },
    boolean: {},
    date: {},
    slider: { minimum: '0', maximum: '100', initial_value: '0' },
    counter: { minimum: '0', maximum: '100', initial_value: '0' },
    select: { options: [] },
    photo: {},
  };
  return {
    type: fieldType,
    is_required: false,
    constraints: fieldConstraints[fieldType],
  };
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
          <AddFieldControl text="Text" onClick={this.addField} options={fieldDefaults('string')} />
          <AddFieldControl
            text="Number"
            onClick={this.addField}
            options={fieldDefaults('number')}
          />
          <AddFieldControl
            text="Yes/No"
            onClick={this.addField}
            options={fieldDefaults('boolean')}
          />
          <AddFieldControl text="Date" onClick={this.addField} options={fieldDefaults('date')} />
          <AddFieldControl
            text="Slider"
            onClick={this.addField}
            options={fieldDefaults('slider')}
          />
          <AddFieldControl
            text="Counter"
            onClick={this.addField}
            options={fieldDefaults('counter')}
          />
          <AddFieldControl
            text="Select"
            onClick={this.addField}
            options={fieldDefaults('select')}
          />
          <AddFieldControl text="Photo" onClick={this.addField} options={fieldDefaults('photo')} />
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
