import React, { Component } from 'react';
import classNames from 'classnames';
import { values } from 'lodash';


class FormListItem extends Component {
  render() {
    return <div
      className={classNames('data-form-list-item', {
        active: this.props.active
      })}
      onClick={this.props.onClick}>
      <input type="checkbox" checked={this.props.active}/>
      <h4>{this.props.title}</h4><div className="count">({this.props.count})</div>
    </div>
  }
}

export class FormList extends Component {

  toggleForm(form) {
    if (this.props.form_ids.indexOf(form.id) >= 0) {
      this.props.dataActions.removeFormId(form.id);
    } else {
      this.props.dataActions.addFormId(form.id);
    }
  }

  toggleDeviceLocations() {
    this.props.dataActions.toggleDeviceLocations(!this.props.device_locations_on);
  }

  toggleSpatialTriggers() {
    this.props.dataActions.toggleSpatialTriggers(!this.props.spatial_triggers_on);
  }

  render () {
    return (
      <div className="data-form-list">

        {values(this.props.forms)
          .map(f => {
            let boundClick = this.toggleForm.bind(this, f);
            let count = this.props.form_data.filter(fd => fd.form_id == f.id).length;
            let active = this.props.form_ids.indexOf(f.id) >= 0;
            return <FormListItem key={f.id} active={active} title={f.form_label} count={count}
              onClick={boundClick} />;
          })
        }
        <FormListItem key={'device_locations'}
          active={this.props.device_locations_on}
          title={'Device Locations'}
          count={this.props.device_locations.length}
          onClick={this.toggleDeviceLocations.bind(this)} />
        <FormListItem key={'spatial_triggers'}
          active={this.props.spatial_triggers_on}
          title={'Spatial Triggers'}
          count={this.props.spatial_triggers.length}
          onClick={this.toggleSpatialTriggers.bind(this)} />
        
      </div>
    );
  }
}

export default FormList;