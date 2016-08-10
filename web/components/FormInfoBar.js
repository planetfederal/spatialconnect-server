import React, { PropTypes } from 'react';
import classnames from 'classnames';
import '../style/FormDetails.less';

const FormInfoBar = ({ form, updateActiveForm, saveForm, edited }) => (
  <div className="form-info">
    <div className="form-title">
      <h4>{form.get('form_label')}</h4>
    </div>
    <div className="form-info-block">
      <ul>
        <li><label>Form ID:</label> {form.get('id')}</li>
        <li><label>Form Version:</label> {form.get('version')}</li>
      </ul>
    </div>
    <div className="form-info-block">
      <ul>
        <li><label>Form Key:</label> {form.get('form_key')}</li>
        <li><label>Form Name:</label> {form.get('form_label')}</li>
      </ul>
    </div>
    <div className="form-info-block">
      <ul>
        <li><label>Last Active:</label> 04/25/16 9:40 AM</li>
        <li><label>Number of Records:</label> 23</li>
      </ul>
    </div>
    <div className="form-tools">
      <button className="btn btn-sc" onClick={() => updateActiveForm(form.get('id'))}>Edit</button>
      <button className={classnames('btn', 'btn-sc', {disabled: !edited})} onClick={() => saveForm(form.get('id'))}>
      {edited ? 'Save' : 'Saved'}
      </button>
    </div>
  </div>
);

FormInfoBar.propTypes = {
  form: PropTypes.object.isRequired
};

export default FormInfoBar;