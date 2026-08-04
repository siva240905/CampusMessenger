import sys
import os

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.database import engine, Base, SessionLocal
from app import models, auth
from datetime import datetime, timezone

def seed_db():
    print("[*] Initializing Database schema and seeding initial data...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Create or update default Faculty user
    faculty = db.query(models.User).filter(models.User.username == "faculty").first()
    if not faculty:
        faculty = models.User(
            username="faculty",
            password_hash=auth.get_password_hash("faculty123"),
            full_name="Dr. Aris Thorne (Placement Officer)",
            role="faculty",
            is_active=True
        )
        db.add(faculty)
        print("  [+] Created faculty account (User: 'faculty', Password: 'faculty123')")
    else:
        faculty.password_hash = auth.get_password_hash("faculty123")
        print("  [+] Updated faculty password hash ('faculty123')")

    admin = db.query(models.User).filter(models.User.username == "admin").first()
    if not admin:
        admin = models.User(
            username="admin",
            password_hash=auth.get_password_hash("admin123"),
            full_name="System Administrator",
            role="admin",
            is_active=True
        )
        db.add(admin)
        print("  [+] Created admin account (User: 'admin', Password: 'admin123')")
    else:
        admin.password_hash = auth.get_password_hash("admin123")
        print("  [+] Updated admin password hash ('admin123')")


    # Sample broadcast
    sample_b = db.query(models.Broadcast).first()
    if not sample_b:
        b1 = models.Broadcast(
            title="Google Campus Placement 2026 Registration Open",
            message="All final year CS & IT students must complete their registration before 5:00 PM today. Link attached below.",
            url="https://careers.google.com/students/",
            priority="high",
            is_emergency=False,
            sender_name="Placement Cell"
        )
        b2 = models.Broadcast(
            title="EMERGENCY: Severe Weather Notice",
            message="Due to torrential rain warnings, all afternoon lab classes are suspended. Please remain indoors.",
            priority="emergency",
            is_emergency=True,
            sender_name="Campus Security"
        )
        db.add_all([b1, b2])
        print("  [+] Created sample announcements")

    db.commit()
    db.close()
    print("[+] Database seeding complete!")

if __name__ == "__main__":
    seed_db()

