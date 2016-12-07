import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { find } from 'lodash';
import ReactBreadcrumbs from 'react-breadcrumbs';

class Breadcrumbs extends Component {

  render() {
    const { sc, params } = this.props;
    const routes = this.props.routes.map((r) => {
      const route = r;
      if (route.path === '/stores/:id') {
        const store = find(sc.dataStores.stores, { id: params.id });
        if (store) {
          route.name = store.name;
        }
      }
      if (route.path === '/forms/:form_key') {
        const form = sc.forms.get('forms').find(f => f.get('form_key') === params.form_key);
        if (form) {
          route.name = form.get('form_label');
        }
      }
      if (route.path === '/triggers/:id') {
        const trigger = find(sc.triggers.spatial_triggers, { id: params.id });
        if (trigger) {
          route.name = trigger.name;
        }
      }
      return route;
    });

    return (
      <div>
        <ReactBreadcrumbs
          separator="&nbsp;&nbsp;&nbsp;&nbsp;>&nbsp;&nbsp;&nbsp;&nbsp;"
          excludes={['Home']} hideNoPath routes={routes} params={this.props.params}
        />
      </div>
    );
  }
}

Breadcrumbs.propTypes = {
  sc: PropTypes.object.isRequired,
  params: PropTypes.object.isRequired,
  routes: PropTypes.array.isRequired,
};


const mapStateToProps = state => ({
  sc: state.sc,
});

  // connect this "smart" container component to the redux store
export default connect(mapStateToProps)(Breadcrumbs);
