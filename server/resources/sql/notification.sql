-- name: insert-notification!
-- adds notifications to the queue
INSERT INTO notifications (trigger_id,created_at) VALUES (:trigger_id,NOW());

-- name: unsent-notifications-list
-- notifications list
SELECT * FROM notifications WHERE deleted_at IS NULL;

-- name: mark-as-sent!
-- mark notification as sent
UPDATE notifications SET deleted_at = NOW() WHERE id = :id;