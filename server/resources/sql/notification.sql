-- name: insert-notification<!
-- adds notifications to the queue
INSERT INTO notifications (recipient,message_id)
VALUES (:recipient,:message_id);

-- name: unsent-notifications-list
-- notifications list
SELECT n.id,n.recipient,n.delivered,n.sent,m.type,m.info
FROM notifications AS n JOIN messages AS m
ON m.id = n.message_id WHERE n.sent IS NULL;

-- name: undelivered-notifications-list
SELECT n.id,n.recipient,n.delivered,n.sent,m.type,m.info
FROM notifications AS n JOIN messages AS m
ON m.id = n.message_id WHERE n.delivered IS NULL;

-- name: find-notification-by-id-query
-- retrieve and individual notification
SELECT n.id,n.recipient,n.delivered,n.sent,m.type,m.info
FROM notifications AS n JOIN messages AS m
ON m.id = n.message_id WHERE n.id = :id;

-- name: mark-as-sent!
-- mark notification as sent
UPDATE notifications SET sent = NOW() WHERE id = :id;

-- name: mark-as-delivered!
-- mark notification as delivered
UPDATE notifications SET delivered = NOW() WHERE id = :id;

-- name: insert-message<!
-- inserts a message to be delivered
INSERT INTO messages (info,type)
VALUES (:info::json,:type::source_type);

-- name: find-message-by-id-query
-- gets an individual message
SELECT * FROM messages WHERE id = :id;