'use strict';
import React, { PropTypes } from 'react';
import { Link } from 'react-router';

const EventItem = ({ event }) => (
  <li className="list-item">
    <h4>{event.name}</h4>
    <p>{event.description}</p>
    <Link to={`/events/${event.id}`}>Event Details</Link>
  </li>
);

EventItem.propTypes = {
  event: PropTypes.object.isRequired
}

const EventsList = ({ eventsList }) => (
  <ul className="list">
    {eventsList.map(evt => <EventItem event={evt} key={evt.id} />)}
  </ul>
);

EventsList.propTypes = {
  eventsList: PropTypes.array.isRequired
}

export default EventsList;
