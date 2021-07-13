--@block
CREATE TABLE messages(
    'id' INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    'user' NOT NULL,
    'msg' VARCHAR(1024) NOT NULL,
    'time' DATETIME NOT NULL DEFAULT (strftime('%d.%m.%Y %H:%M:%S', 'now', 'localtime')),
    FOREIGN KEY (user) REFERENCES users(name)
);


--@block
CREATE TABLE users(
    'id' INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    'name' VARCHAR(16),
    'password' VARCHAR(32)
);