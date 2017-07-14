import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import SendMessage from '../components/SendMessage';
import * as messagesActions from '../ducks/auth';

class MessageContainer extends Component {
  state = { open: false };
  open = () => this.setState({ open: true });
  cancel = () => this.setState({ open: false });
  render() {
    return (
      <div className="wrapper">
        <section className="main">
          {this.state.open
            ? <SendMessage actions={this.props.actions} cancel={this.cancel} />
            : <button type="submit" className="btn btn-sc" onClick={this.open}>
                Notify All Devices
              </button>}
        </section>
      </div>
    );
  }
}

MessageContainer.propTypes = {
  actions: PropTypes.object.isRequired,
};
//
// const mapStateToProps = state => ({
//   isAuthenticating: state.sc.auth.isAuthenticating,
//   statusText: state.sc.auth.statusText,
// });

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(messagesActions, dispatch),
});

export default connect(null, mapDispatchToProps)(MessageContainer);
