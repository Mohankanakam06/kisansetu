import sys
import os
from PIL import Image

def generate_icons(logo_path, out_dir):
    os.makedirs(out_dir, exist_ok=True)
    if not os.path.exists(logo_path):
        print(f"Error: {logo_path} not found.")
        sys.exit(1)

    img = Image.open(logo_path).convert("RGBA")

    # 1. 192x192
    img_192 = img.copy()
    img_192.thumbnail((192, 192), Image.Resampling.LANCZOS)
    bg_192 = Image.new("RGBA", (192, 192), (255, 255, 255, 0))
    bg_192.paste(img_192, ((192 - img_192.width) // 2, (192 - img_192.height) // 2))
    bg_192.save(os.path.join(out_dir, "icon-192x192.png"))

    # 2. 512x512
    img_512 = img.copy()
    img_512.thumbnail((512, 512), Image.Resampling.LANCZOS)
    bg_512 = Image.new("RGBA", (512, 512), (255, 255, 255, 0))
    bg_512.paste(img_512, ((512 - img_512.width) // 2, (512 - img_512.height) // 2))
    bg_512.save(os.path.join(out_dir, "icon-512x512.png"))

    # 3. Maskable (safe zone 80% = ~409px)
    maskable_margin = 512 - 409
    img_maskable = img.copy()
    img_maskable.thumbnail((409, 409), Image.Resampling.LANCZOS)
    bg_maskable = Image.new("RGBA", (512, 512), (6, 78, 59, 255)) # emerald-950 background
    bg_maskable.paste(img_maskable, ((512 - img_maskable.width) // 2, (512 - img_maskable.height) // 2), img_maskable)
    bg_maskable.save(os.path.join(out_dir, "icon-512x512-maskable.png"))

    # 4. Apple Touch Icon (180x180, usually solid bg)
    img_apple = img.copy()
    img_apple.thumbnail((140, 140), Image.Resampling.LANCZOS)
    bg_apple = Image.new("RGB", (180, 180), (255, 255, 255))
    bg_apple.paste(img_apple, ((180 - img_apple.width) // 2, (180 - img_apple.height) // 2), img_apple)
    bg_apple.save(os.path.join(out_dir, "apple-touch-icon.png"))

    print("Icons generated successfully!")

if __name__ == "__main__":
    generate_icons("public/logo.png", "public/icons")
