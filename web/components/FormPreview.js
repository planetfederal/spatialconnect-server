import React, { Component, PropTypes } from 'react';
import t from 'tcomb-form';
import transform from 'tcomb-json-schema';
import scformschema from 'spatialconnect-form-schema';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import sortBy from 'lodash/sortBy';
import uniqueId from 'lodash/uniqueId';
import Field from './Field';
import '../style/FormDetails.less';

transform.registerType('date', t.Date);
transform.registerType('time', t.Date);

class FormPreview extends Component {

  static onSubmit(e) {
    e.preventDefault();
  }

  constructor(props) {
    super(props);

    this.moveField = this.moveField.bind(this);
    this.onFormChange = this.onFormChange.bind(this);
  }

  onFormChange(value) {
    this.props.updateFormValue(this.props.form.form_key, value);
  }

  moveField(dragIndex, hoverIndex) {
    this.props.swapFieldOrder(this.props.form.form_key, dragIndex, hoverIndex);
  }

  template(locals) {
    const inputs = sortBy(this.props.form.fields, 'position').map((field, idx) => (
      <Field
        field={field}
        updateActiveField={this.props.updateActiveField}
        form={this.props.form}
        input={locals.inputs[field.field_key]}
        key={`field.${field.field_key}.${uniqueId()}`}
        moveField={this.moveField}
        position={field.position}
        id={field.id}
        index={idx}
      />
      ));
    return (
      <fieldset>
        {inputs}
      </fieldset>
    );
  }

  render() {
    const { form } = this.props;
    let formEl;
    if (form.fields.length === 0) {
      formEl = <div><p className="warning-message">Add fields.</p></div>;
    } else {
      const { schema, options } = scformschema.translate(form);
      options.template = locals => this.template(locals);
      formEl = (
        <form onSubmit={FormPreview.onSubmit}>
          <t.form.Form
            type={transform(schema)}
            options={options}
            value={form.value}
            onChange={this.onFormChange}
          />
        </form>
      );
    }
    return (
      <div className="form-preview form-pane">
        <div className="form-pane-title"><h5>Form Preview</h5></div>
        <div className="form-pane-wrapper">
          {formEl}
        </div>
      </div>
    );
  }
}

FormPreview.propTypes = {
  form: PropTypes.object.isRequired,
  updateFormValue: PropTypes.func.isRequired,
  swapFieldOrder: PropTypes.func.isRequired,
  updateActiveField: PropTypes.func.isRequired,
};

export default DragDropContext(HTML5Backend)(FormPreview);
