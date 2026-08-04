-- CampusLink Database Schema for SQLite

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'faculty',
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id VARCHAR(100) UNIQUE NOT NULL,
    computer_name VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    mac_address VARCHAR(50),
    os_info VARCHAR(100) NOT NULL,
    client_version VARCHAR(20) DEFAULT '1.0.0',
    status VARCHAR(20) DEFAULT 'online',
    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    registered_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS broadcasts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    broadcast_id VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    url VARCHAR(500),
    file_path VARCHAR(500),
    file_name VARCHAR(200),
    file_size INTEGER,
    image_path VARCHAR(500),
    priority VARCHAR(20) DEFAULT 'normal',
    is_emergency BOOLEAN DEFAULT 0,
    sender_name VARCHAR(100) DEFAULT 'Faculty Office',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS delivery_receipts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    broadcast_id VARCHAR(100) NOT NULL,
    client_id VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'delivered',
    received_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(broadcast_id) REFERENCES broadcasts(broadcast_id) ON DELETE CASCADE,
    FOREIGN KEY(client_id) REFERENCES clients(client_id)
);

CREATE TABLE IF NOT EXISTS analytics_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type VARCHAR(50) NOT NULL,
    details TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
