import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import SendMessage from '../components/SendMessage';
import * as messagesActions from '../ducks/messages';

const MessageContainer = props => (
  <div className="wrapper">
    <section className="main">
      {props.sendAll
        ? <SendMessage {...props} />
        : <button type="submit" className="btn btn-sc" onClick={props.actions.sendAll}>
            Notify All Devices
          </button>}
    </section>
  </div>
);

MessageContainer.propTypes = {
  actions: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  ...state.sc.messages,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(messagesActions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(MessageContainer);
