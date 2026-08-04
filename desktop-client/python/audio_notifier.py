import sys
import os

def play_alert(is_emergency=False):
    """
    Plays audio chime for incoming LAN broadcasts.
    Uses platform native sound synthesizers.
    """
    try:
        if sys.platform == "win32":
            import winsound
            if is_emergency:
                # Urgent double siren tone
                winsound.Beep(1200, 150)
                winsound.Beep(800, 150)
                winsound.Beep(1200, 250)
            else:
                # Pleasant Apple/Windows Notification chime
                winsound.Beep(523, 100) # C5
                winsound.Beep(659, 100) # E5
                winsound.Beep(784, 150) # G5
        else:
            # Fallback bell sound on POSIX
            print("\a")
    except Exception as e:
        print(f"Audio playback error: {e}")
