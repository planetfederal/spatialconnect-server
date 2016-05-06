'use strict';
import React, { PropTypes } from 'react';
import { Link, browserHistory } from 'react-router';
import '../style/FormList.less';

const FormItem = ({ form }) => (
  <div className="form-item" onClick={() => browserHistory.push(`/forms/${form.get('id')}`)}>
    <h4><Link to={`/forms/${form.get('id')}`}>{form.get('name')}</Link></h4>
    <p>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.</p>
    <ul>
      <li>Number of Records: 23</li>
      <li>Last Active: 14 hours ago</li>
    </ul>
  </div>
);

FormItem.propTypes = {
  form: PropTypes.object.isRequired
};

const FormsList = ({ forms, addForm }) => (
  <div className="form-list">
    <button className="btn btn-sc" onClick={addForm}>Create Form</button>
    {forms.valueSeq().map(f => {
      return <FormItem form={f} key={f.get('id')} />
    })}
  </div>
);

FormsList.propTypes = {
  forms: PropTypes.object.isRequired
};

export default FormsList;
