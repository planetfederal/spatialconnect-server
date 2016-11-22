'use strict';
import React, { PropTypes } from 'react';
import { Link, browserHistory } from 'react-router';
import moment from 'moment';
import PropertyListItem from './PropertyListItem';
import '../style/FormList.less';

const FormItem = ({ form }) => (
  <div className="form-item">
    <h4><Link to={`/forms/${form.get('form_key')}`}>{form.get('form_label')}</Link></h4>
    <div className="properties">
      <PropertyListItem name={'Version'} value={form.get('version')} />
      <PropertyListItem name={'Team'} value={form.get('team_name')} />
      {form.get('metadata') ?
      <div>
        <PropertyListItem name={'Number of Records'} value={form.get('metadata').get('count')} />
        {form.get('metadata').get('lastActivity') ?
          <PropertyListItem name={'Last Activity'} value={moment(form.get('metadata').get('lastActivity')).fromNow()} />
        : null}
      </div> : null }
    </div>
  </div>
);

FormItem.propTypes = {
  form: PropTypes.object.isRequired
};

const FormsList = ({ forms }) => (
  <div className="form-list">
    {forms.valueSeq().map(f => {
      return <FormItem form={f} key={f.get('id')} />
    })}
  </div>
);

FormsList.propTypes = {
  forms: PropTypes.object.isRequired
};

export default FormsList;
