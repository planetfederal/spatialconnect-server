INSERT INTO users (name,email,password) VALUES ('Admin Person','admin@something.com','bcrypt+sha512$4588e3bec69d6cd42533a71ac375c2e7$12$a56c911a6bd02cb7a872fc6d5d6876462b99c44f4bdc8218');
INSERT INTO organizations (name) VALUES ('My Organization Name');
INSERT INTO teams (name, organization_id) values ('My First Group Name', 1);
INSERT INTO teams (name, organization_id) values ('Another Group Name', 1);
INSERT INTO user_team (user_id, team_id) values (1,1);
INSERT INTO user_team (user_id, team_id) values (1,2);