import React, { Component, PropTypes } from 'react';
import t from 'tcomb-form';
import transform from 'tcomb-json-schema';
import scformschema from 'spatialconnect-form-schema';
import { DragSource } from 'react-dnd';
import Field from './Field';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import _ from 'lodash';
import '../style/FormDetails.less';

transform.registerType('date', t.Date);
transform.registerType('time', t.Date);

class FormPreview extends Component {

  template(locals) {
    let inputs = _.sortBy(this.props.form.get('fields').toJS(), 'order').map((field, idx) => {
      return (
        <Field
          updateActiveField={this.props.updateActiveField}
          form={this.props.form}
          input={locals.inputs[field.id]}
          key={field.id}
          moveField={this.moveField.bind(this)}
          order={field.order}
          id={field.id}
          index={idx}
          />
      );
    });
    return (
      <fieldset>
        {inputs}
      </fieldset>
    )
  }

  moveField(dragIndex, hoverIndex) {
    this.props.swapFieldOrder(this.props.form.get('id'), dragIndex, hoverIndex);
  }

  onFormChange(value) {
    this.props.updateFormValue(this.props.form.get('id'), value);
  }

  onSubmit(e) {
    e.preventDefault();
  }

  render() {
    let { form } = this.props;
    let formEl;
    if (form.get('fields').size == 0) {
      formEl = <div><p className="warning-message">Add fields.</p></div>;
    } else {
      //console.log(JSON.stringify(form.toJS()));
      let { schema, options } = scformschema.translate(form.toJS());
      options.template = locals => this.template(locals);
      formEl = (
        <form onSubmit={this.onSubmit}>
          <t.form.Form
            ref="form"
            type={transform(schema)}
            options={options}
            value={form.get('value').toJS()}
            onChange={this.onFormChange.bind(this)}
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
  form: PropTypes.object.isRequired
};

export default DragDropContext(HTML5Backend)(FormPreview);