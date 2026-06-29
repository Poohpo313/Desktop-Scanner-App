from PIL import Image
import os

BASE = os.path.join(os.path.dirname(__file__), "..", "src", "icons")
ASSETS = r"C:\Users\User\.cursor\projects\c-Users-User-Downloads-admin-interface-react-20260609T143925Z-3-001\assets"

JOBS = [
    ("sidebar-help-icon.png", "Screenshot_2026-06-17_020421-c0c2a894-a4fd-4202-abc2-7b800fa3ffaf.png", "sidebar", 36),
    ("sidebar-devices-icon.png", "Screenshot_2026-06-17_020334-9d57ce6d-5ea6-47e8-960b-80d9bdee8814.png", "sidebar", 36),
    ("sidebar-keys-icon.png", "Screenshot_2026-06-17_020256-d52e931f-fa40-4c05-bd53-c70c726ad403.png", "sidebar", 36),
    ("sidebar-user-registration-icon.png", "Screenshot_2026-06-17_015940-3315cc94-3431-450e-8eae-5bcc8ededf01.png", "sidebar", 36),
    ("dash-total-users-icon.png", "Screenshot_2026-06-17_012120-62a4cab0-71a4-445b-8e68-ce1ed8854156.png", "dash", 72),
    ("dash-active-devices-icon.png", "Screenshot_2026-06-17_012648-7a0de9e4-ca1e-488a-b510-b67d286a85aa.png", "dash", 72),
    ("dash-assigned-keys-icon.png", "Screenshot_2026-06-17_014120-92713617-31c4-4628-982b-039748f4571c.png", "dash", 72),
    ("dash-available-keys-icon.png", "Screenshot_2026-06-17_014216-f45cff09-1010-409f-bf1b-5c23295e1fa9.png", "dash", 72),
    (
        "license-key-catalog-total-serial-keys-icon.png",
        "image-21eeaf6a-7e59-4aa7-905a-f1b4c29b3de0.png",
        "dash",
        72,
    ),
    (
        "user-registration-assigned-serial-keys-icon.png",
        "image-8551cbf7-49f2-41fa-b1fb-efc6ccea9867.png",
        "dash",
        72,
    ),
    (
        "user-registration-registered-users-icon.png",
        "image-717a47ae-7e47-45ca-ba7b-0d71cd63f8cf.png",
        "dash",
        72,
    ),
    (
        "user-registration-active-accounts-icon.png",
        "image-be62cbeb-643d-4790-9007-e7d51754a183.png",
        "dash",
        72,
    ),
]


def is_dark_bg(r, g, b):
    return r < 45 and g < 95 and b < 95


def is_light_bg(r, g, b):
    lum = (r + g + b) / 3
    spread = max(r, g, b) - min(r, g, b)
    if lum > 215 and spread < 35:
        return True
    if lum > 175 and spread < 55 and b >= r and b >= g:
        return True
    return False


def process_sidebar(img):
    px = img.load()
    w, h = img.size
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    opx = out.load()
    for y in range(h):
        for x in range(w):
            r, g, b, _a = px[x, y]
            if is_dark_bg(r, g, b):
                continue
            lum = (r + g + b) / 3
            if lum > 175:
                opx[x, y] = (255, 255, 255, 255)
            elif lum > 120:
                alpha = min(255, int((lum - 100) * 4))
                opx[x, y] = (255, 255, 255, alpha)
    return out


def process_dash(img):
    px = img.load()
    w, h = img.size
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    opx = out.load()
    for y in range(h):
        for x in range(w):
            r, g, b, _a = px[x, y]
            if is_light_bg(r, g, b):
                continue
            spread = max(r, g, b) - min(r, g, b)
            lum = (r + g + b) / 3
            if spread < 25 and lum > 150:
                continue
            if lum > 200 and spread < 40:
                continue
            opx[x, y] = (r, g, b, 255)
    return out


def main():
    for out_name, src_name, kind, size in JOBS:
        src = os.path.join(
            ASSETS,
            f"c__Users_User_AppData_Roaming_Cursor_User_workspaceStorage_c3543d60cc7b71f48ed586023aaca7fc_images_{src_name}",
        )
        img = Image.open(src).convert("RGBA")
        processed = process_sidebar(img) if kind == "sidebar" else process_dash(img)
        bbox = processed.getbbox()
        if not bbox:
            print("NO BBOX", out_name)
            continue
        cropped = processed.crop(bbox)
        canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        scale = min(size / cropped.width, size / cropped.height) * 0.88
        nw = max(1, int(cropped.width * scale))
        nh = max(1, int(cropped.height * scale))
        resized = cropped.resize((nw, nh), Image.Resampling.LANCZOS)
        ox, oy = (size - nw) // 2, (size - nh) // 2
        canvas.paste(resized, (ox, oy), resized)
        dst = os.path.join(BASE, out_name)
        canvas.save(dst)
        print("saved", out_name, canvas.size)


if __name__ == "__main__":
    main()
