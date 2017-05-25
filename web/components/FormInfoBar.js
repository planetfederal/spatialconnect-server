import React, { PropTypes } from 'react';
import classnames from 'classnames';
import format from 'date-fns/format';
import '../style/FormDetails.less';

const DATE_FORMAT = 'M/D/YY h:mm a';

const FormInfoBar = ({ form, updateActiveForm, saveForm, edited }) => (
  <div className="form-info">
    <div className="form-title">
      <h4>{form.form_label}</h4>
    </div>
    {form.metadata
      ? <div className="form-info-block">
          <ul>
            {form.metadata.lastActivity
              ? <li>
                  <label htmlFor="last-active">Last Active: </label>
                  {format(form.metadata.lastActivity, DATE_FORMAT)}
                </li>
              : null}
            {form.metadata.count
              ? <li>
                  <label htmlFor="number-of-records">Number of Records:</label>
                  {form.metadata.count}
                </li>
              : null}
          </ul>
        </div>
      : null}
    <div className="form-tools">
      <button className="btn btn-sc" onClick={() => updateActiveForm(form.form_key)}>
        Edit
      </button>
      <button
        className={classnames('btn', 'btn-sc', { disabled: !edited })}
        onClick={() => saveForm(form.form_key)}
      >
        {edited ? 'Save' : 'Saved'}
      </button>
    </div>
  </div>
);

FormInfoBar.propTypes = {
  form: PropTypes.object.isRequired,
  updateActiveForm: PropTypes.func.isRequired,
  saveForm: PropTypes.func.isRequired,
  edited: PropTypes.bool.isRequired,
};

export default FormInfoBar;
