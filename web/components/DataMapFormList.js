import React, { Component } from 'react';
import classNames from 'classnames';

export class FormList extends Component {

  toggleForm(form) {
    if (this.props.form_ids.indexOf(form.id) >= 0) {
      this.props.actions.removeFormId(form.id);
    } else {
      this.props.actions.addFormId(form.id);
    }
  }

  render () {
    return (
      <div className="data-form-list">
        
        <div className="data-form-list-items">
        {this.props.forms.valueSeq()
          .map(f => f.toJS())
          .map(f => {
            let active = this.props.form_ids.indexOf(f.id) >= 0;
            let c = classNames('data-form-list-item', {
              active: active
            });
            return <div
              key={f.id}
              className={c}
              onClick={e => this.toggleForm(f)}>
              <input type="checkbox" checked={active}/>
              <h4>{f.form_label}</h4>
            </div>
          })
        }
        </div>
      </div>
    );
  }
}

export default FormList;