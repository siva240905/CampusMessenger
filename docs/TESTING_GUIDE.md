# CampusLink Testing & Verification Guide

Follow these steps to test end-to-end functionality.

---

## 1. Backend Integration Test

Start backend server:
```bash
python backend/run_backend.py
```

Verify endpoints using `curl` or browser:
- OpenAPI Documentation: `http://127.0.0.1:8000/docs`
- Health check: `http://127.0.0.1:8000/`

---

## 2. Authentication Test

Execute a login request:
```bash
curl -X POST "http://127.0.0.1:8000/api/v1/auth/login" \
     -H "Content-Type: application/json" \
     -d "{\"username\": \"faculty\", \"password\": \"faculty123\"}"
```
Expected output: JSON containing `access_token` and user details.

---

## 3. Real-Time Broadcast Test

1. Start Desktop Client:
   ```bash
   python desktop-client/python/client.py 127.0.0.1
   ```
2. Open Faculty Dashboard (`http://localhost:3000` or open login).
3. Type an announcement title e.g. "Placement Drive 2026", add a link e.g. `https://google.com`, and click **Broadcast Instantly**.
4. **Verification**:
   - Desktop client displays floating popup window in bottom right of screen.
   - Audio chime plays.
   - Delivery count increments on Faculty Dashboard in `<1 second`.

---

## 4. Multi-Client Simulation Test

Simulate 50 parallel student computers using Python script:
```python
import asyncio
import websockets

async def simulate_client(i):
    uri = f"ws://127.0.0.1:8000/ws?client_id=sim_{i}&computer_name=LAB-PC-{i}&ip_address=192.168.1.{i}"
    async with websockets.connect(uri) as ws:
        print(f"Simulated client {i} connected.")
        while True:
            msg = await ws.recv()
            print(f"Simulated client {i} received broadcast packet!")

async def main():
    await asyncio.gather(*[simulate_client(i) for i in range(1, 51)])

asyncio.run(main())
```
Observe sub-second delivery to all 50 simulated clients in real time!
