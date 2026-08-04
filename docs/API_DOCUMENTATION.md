# CampusLink API Documentation

Version: 1.0.0  
Protocol: HTTP/REST & WebSocket  
Authentication: JWT (Bearer Token) & WebSocket URL handshake

---

## 1. Authentication Endpoints

### `POST /api/v1/auth/login`
Authenticates faculty member and returns a JWT Bearer access token.

#### Request Body
```json
{
  "username": "faculty",
  "password": "faculty123"
}
```

#### Response (200 OK)
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
  "token_type": "bearer",
  "user_id": 1,
  "username": "faculty",
  "full_name": "Dr. Aris Thorne",
  "role": "faculty"
}
```

---

## 2. Broadcast Endpoints

### `POST /api/v1/broadcast`
Broadcasts an announcement, registration link, PDF document, or emergency alert to all connected student computers in sub-second time `< 1s`.

#### Headers
- `Authorization`: `Bearer <token>`

#### Request Body
```json
{
  "title": "Google Placement Registration 2026",
  "message": "Complete your registration before 5:00 PM.",
  "url": "https://careers.google.com/students/",
  "file_path": "/static/uploads/notice.pdf",
  "file_name": "notice.pdf",
  "file_size": 204800,
  "image_path": "/static/uploads/banner.png",
  "priority": "high",
  "is_emergency": false
}
```

#### Response (200 OK)
```json
{
  "id": 1,
  "broadcast_id": "8f3b6c2d-...",
  "title": "Google Placement Registration 2026",
  "message": "Complete your registration before 5:00 PM.",
  "url": "https://careers.google.com/students/",
  "file_path": "/static/uploads/notice.pdf",
  "priority": "high",
  "is_emergency": false,
  "sender_name": "Dr. Aris Thorne",
  "created_at": "2026-08-03T19:50:00Z",
  "delivery_count": 42
}
```

---

## 3. WebSocket Real-Time Channel

### `WebSocket /ws`

#### Query Parameters:
- `client_id`: Unique client identifier (e.g. `client_LAB-PC-01_192_168_1_50`)
- `computer_name`: Hostname (e.g. `LAB-PC-01`)
- `ip_address`: Local LAN IP
- `os_info`: OS name and version
- `client_version`: Client app version
- `role`: `student` (default) or `faculty_dashboard`

#### Sub-Second Incoming Broadcast Packet Payload:
```json
{
  "type": "broadcast",
  "broadcast_id": "8f3b6c2d-...",
  "title": "Placement Drive Alert",
  "message": "Registration link is live.",
  "url": "https://placement.college.edu",
  "file": "/static/uploads/placement_guide.pdf",
  "file_name": "placement_guide.pdf",
  "priority": "high",
  "is_emergency": false,
  "timestamp": "2026-08-03T19:50:00Z"
}
```

---

## 4. File Upload & QR Code Endpoints

### `POST /api/v1/upload/file`
Uploads a document file to the static LAN uploads directory.

### `POST /api/v1/upload/image`
Uploads an image banner for notification popups.

### `GET /api/v1/upload/qrcode?url=<URL>`
Generates a QR Code PNG image for any placement registration URL.

---

## 5. Client & Analytics Endpoints

### `GET /api/v1/clients`
Returns list of all active & historical student computers on the LAN.

### `GET /api/v1/messages`
Returns paginated broadcast history with search and priority filters.

### `DELETE /api/v1/messages/{broadcast_id}`
Deletes a broadcast message from history.

### `GET /api/v1/analytics`
Returns total online clients, total broadcasts, files shared, links shared, and activity log.
