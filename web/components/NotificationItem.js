import React, { PropTypes } from 'react';
import moment from 'moment';
import PropertyListItem from './PropertyListItem';
import '../style/FormList.less';

const dateFormat = 'dddd, MMMM Do YYYY, h:mm:ss a';

const NotificationItem = ({ notification }) => (
  <div className="form-item">
    <div className="properties">
      <PropertyListItem name={'Recipient'} value={notification.recipient} />
      <PropertyListItem name={'Type'} value={notification.type} />
      <PropertyListItem
        name={'Sent'}
        value={notification.sent ? moment(notification.sent).format(dateFormat)
         : 'Not Sent'}
      />
      <PropertyListItem
        name={'Delivered'}
        value={notification.delivered ? moment(notification.delivered).format(dateFormat)
          : 'Not Delivered'}
      />
    </div>
  </div>
);

NotificationItem.propTypes = {
  notification: PropTypes.object.isRequired,
};

export default NotificationItem;
