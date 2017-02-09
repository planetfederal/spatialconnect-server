--  Copyright  Copyright 2016-2017 Boundless, http://boundlessgeo.com
--
--  Licensed under the Apache License, Version 2.0 (the "License");
--  you may not use this file except in compliance with the License.
--  You may obtain a copy of the License at
--
--  http://www.apache.org/licenses/LICENSE-2.0
--
--  Unless required by applicable law or agreed to in writing, software
--  distributed under the License is distributed on an "AS IS" BASIS,
--  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
--  See the License for the specific language governing permissions and
--  limitations under the License.

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
VALUES (:info::json,:type::message_type);

-- name: find-message-by-id-query
-- gets an individual message
SELECT * FROM messages WHERE id = :id;