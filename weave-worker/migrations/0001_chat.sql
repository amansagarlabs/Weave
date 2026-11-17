CREATE TABLE users (id INTEGER PRIMARY KEY,email TEXT NOT NULL UNIQUE,phone TEXT UNIQUE,password_hash TEXT NOT NULL,role TEXT NOT NULL CHECK(role IN ('CREATOR','BRAND','EDITOR','ADMIN')),locale TEXT NOT NULL DEFAULT 'en-IN',email_verified INTEGER NOT NULL DEFAULT 1,suspended INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE bookings (id INTEGER PRIMARY KEY,brand_id INTEGER NOT NULL REFERENCES users(id),creator_id INTEGER NOT NULL REFERENCES users(id),status TEXT NOT NULL,amount NUMERIC);
CREATE TABLE messages (id INTEGER PRIMARY KEY AUTOINCREMENT,thread_id TEXT NOT NULL,sender_id INTEGER NOT NULL REFERENCES users(id),recipient_id INTEGER NOT NULL REFERENCES users(id),body TEXT NOT NULL CHECK(length(body)<=5000),created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX idx_messages_thread_created ON messages(thread_id,created_at,id);
CREATE INDEX idx_messages_sender_created ON messages(sender_id,created_at DESC);
CREATE INDEX idx_messages_recipient_created ON messages(recipient_id,created_at DESC);

CREATE TABLE message_reactions (message_id INTEGER NOT NULL REFERENCES messages(id) ON DELETE CASCADE,user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,emoji TEXT NOT NULL CHECK(length(emoji)<=16),created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,PRIMARY KEY(message_id,user_id,emoji));
CREATE INDEX idx_message_reactions_message ON message_reactions(message_id);

CREATE TABLE message_attachments (id INTEGER PRIMARY KEY AUTOINCREMENT,thread_id TEXT NOT NULL,uploader_id INTEGER NOT NULL REFERENCES users(id),message_id INTEGER REFERENCES messages(id) ON DELETE CASCADE,object_key TEXT NOT NULL UNIQUE,file_name TEXT NOT NULL,content_type TEXT NOT NULL,size_bytes INTEGER NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX idx_message_attachments_message ON message_attachments(message_id);
