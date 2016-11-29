import React, { PropTypes } from 'react';
import classnames from 'classnames';
import moment from 'moment';
import '../style/FormDetails.less';

const DATE_FORMAT = 'M/D/YY h:mm a';

const FormInfoBar = ({ form, updateActiveForm, saveForm, edited }) => (
  <div className="form-info">
    <div className="form-title">
      <h4>{form.get('form_label')}</h4>
    </div>
    {form.get('metadata') ?
    <div className="form-info-block">
      <ul>
        {form.get('metadata').get('lastActivity') ?
        <li><label>Last Active:</label> {moment(form.get('metadata').get('lastActivity')).format(DATE_FORMAT)}</li>
        : null }
        {form.get('metadata').get('count') ?
        <li><label>Number of Records:</label> {form.get('metadata').get('count')}</li>
        : null }
      </ul>
    </div> : null }
    <div className="form-tools">
      <button className="btn btn-sc" onClick={() => updateActiveForm(form.get('form_key'))}>Edit</button>
      <button className={classnames('btn', 'btn-sc', {disabled: !edited})} onClick={() => saveForm(form.get('form_key'))}>
      {edited ? 'Save' : 'Saved'}
      </button>
    </div>
  </div>
);

FormInfoBar.propTypes = {
  form: PropTypes.object.isRequired
};

export default FormInfoBar;