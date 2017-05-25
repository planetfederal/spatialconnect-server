import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import format from 'date-fns/format';
import PropertyListItem from './PropertyListItem';
import '../style/FormList.less';

const DATE_FORMAT = 'M/D/YY h:mm a';

const FormItem = ({ form }) => (
  <div className="form-item">
    <h4><Link to={`/forms/${form.form_key}`}>{form.form_label}</Link></h4>
    <div className="properties">
      <PropertyListItem name={'Version'} value={form.version} />
      <PropertyListItem name={'Team'} value={form.team_name} />
      {form.metadata
        ? <div>
            <PropertyListItem
              name={'Number of Records'}
              value={form.metadata.count}
            />
            {form.metadata.lastActivity
              ? <PropertyListItem
                  name={'Last Activity'}
                  value={format(form.metadata.lastActivity, DATE_FORMAT)}
                />
              : null}
          </div>
        : null}
    </div>
  </div>
);

FormItem.propTypes = {
  form: PropTypes.object.isRequired,
};

const FormsList = ({ forms, selectedTeamId }) => (
  <div className="form-list">
    {Object.keys(forms).map(key => {
      const form = forms[key];
      if (selectedTeamId === form.team_id) {
        return <FormItem form={form} key={form.id} />;
      }
      return null;
    })}
  </div>
);

FormsList.propTypes = {
  forms: PropTypes.object.isRequired,
  selectedTeamId: PropTypes.number.isRequired,
};

export default FormsList;
