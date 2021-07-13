--@block
CREATE TABLE messages(
    'id' INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    'nick' VARCHAR(32) NOT NULL,
    'msg' VARCHAR(1024) NOT NULL,
    'time' DATETIME NOT NULL DEFAULT (strftime('%d.%m.%Y %H:%M:%S', 'now', 'localtime'))
);