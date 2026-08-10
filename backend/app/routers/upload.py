import os
import uuid
import qrcode
from io import BytesIO
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import FileResponse
from app.config import settings
from app.auth import get_current_user
from app.models import User

router = APIRouter(prefix="/upload", tags=["File Upload & QR Code"])

@router.get("/files/{filename}")
async def get_uploaded_file(filename: str):
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    if not os.path.isfile(file_path):
        raise HTTPException(status_code=404, detail=f"File '{filename}' not found")
    return FileResponse(file_path)

@router.post("/file")
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Uploads a file to the LAN server uploads directory.
    Returns relative file path and download details.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
    
    content = await file.read()
    file_size = len(content)
    
    with open(file_path, "wb") as f:
        f.write(content)
        
    relative_url = f"/static/uploads/{unique_filename}"
    
    return {
        "file_name": file.filename,
        "file_path": relative_url,
        "file_size": file_size,
        "content_type": file.content_type
    }

@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Uploads a photo or video file for preview and transmission to student client systems.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    ext = os.path.splitext(file.filename)[1].lower()
    allowed_exts = [
        # Image / Photo formats
        ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".bmp", ".tiff",
        # Video formats
        ".mp4", ".webm", ".ogg", ".mov", ".avi", ".mkv", ".m4v"
    ]

    is_video = ext in [".mp4", ".webm", ".ogg", ".mov", ".avi", ".mkv", ".m4v"] or (file.content_type and file.content_type.startswith("video/"))
    is_image = ext in [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".bmp", ".tiff"] or (file.content_type and file.content_type.startswith("image/"))

    if not (is_image or is_video) and ext not in allowed_exts:
        raise HTTPException(status_code=400, detail="Invalid media format. Supported: Photos (JPG, PNG, GIF, WEBP, SVG) & Videos (MP4, WEBM, MOV, AVI, MKV)")

    prefix = "vid_" if is_video else "img_"
    unique_filename = f"{prefix}{uuid.uuid4().hex}{ext or ('.mp4' if is_video else '.png')}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    relative_url = f"/static/uploads/{unique_filename}"

    return {
        "file_name": file.filename,
        "image_path": relative_url,
        "is_video": is_video,
        "file_size": len(content),
        "content_type": file.content_type
    }

@router.get("/qrcode")
def generate_qr_code(url: str):
    """
    Generates a QR Code image for any registration link or announcement URL.
    """
    try:
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=10,
            border=4,
        )
        qr.add_data(url)
        qr.make(fit=True)
        img = qr.make_image(fill_color="#4f46e5", back_color="white")
        
        filename = f"qr_{uuid.uuid4().hex[:8]}.png"
        filepath = os.path.join(settings.UPLOAD_DIR, filename)
        img.save(filepath)
        
        return {
            "url": url,
            "qr_image": f"/static/uploads/{filename}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate QR Code: {str(e)}")
