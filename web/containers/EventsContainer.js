'use strict';
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as eventActions from '../ducks/events';
import EventsList from '../components/EventsList';
import AddEvent from '../components/AddEvent';
import NewEventForm from '../components/NewEventForm.js';

class EventsContainer extends Component {

  loadEvents = () => {
    this.props.actions.loadEvents();
  }

  componentDidMount() {
    this.loadEvents();
  }

  addNewEvent = () => {
    this.props.actions.addNewEventClicked();
  }

  submitNewEvent = (data) => {
    this.props.actions.submitNewEvent(data);
  }

  render() {
    const {loading, eventsList, addingNewEvent} = this.props;
    return (
      <div className="wrapper">
        <section className="main">
          {loading ? 'Fetching Events...': ''}
          {addingNewEvent
            ? <NewEventForm submitNewEvent={this.submitNewEvent} />
            : <AddEvent onClick={this.addNewEvent} />}
          <EventsList eventsList={eventsList} />
        </section>
        {this.props.children}
      </div>
    );
  }
}

function mapAtomStateToProps(state) {
  return {
    loading: state.sc.events.loading,
    eventsList: state.sc.events.events,
    addingNewEvent: state.sc.events.addingNewEvent
  };
}

function mapDispatchToProps(dispatch) {
  return { actions: bindActionCreators(eventActions, dispatch) };
}

  // connect this "smart" container component to the redux store
export default connect(mapAtomStateToProps, mapDispatchToProps)(EventsContainer);
