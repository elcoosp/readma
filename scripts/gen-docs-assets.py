"""Generate the documentation brand assets from the high-res repo logo.

Outputs (inside packages/documentation/static/img):
- logo.png        copy of the high-res docs/logo.png
- favicon.ico     multi size ico derived from the logo
- social-card.png 1200x675 social preview in the navy/coral brand
- screenshot.gif  copy of the root demo gif
"""

import shutil
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
IMG = ROOT / "packages" / "documentation" / "static" / "img"

NAVY = (16, 48, 80)          # #103050 deep navy from the logo
NAVY_DARK = (9, 24, 43)      # darker background end
NAVY_MID = (32, 64, 96)      # #204060
CORAL = (240, 115, 80)       # #F07350
CORAL_LIGHT = (244, 140, 105)
WHITE = (245, 248, 252)


def copy_logo() -> None:
    shutil.copyfile(ROOT / "docs" / "logo.png", IMG / "logo.png")
    shutil.copyfile(ROOT / "images" / "screenshot.gif", IMG / "screenshot.gif")
    print("logo.png + screenshot.gif copied")


def gradient_bg(width: int, height: int) -> Image.Image:
    """Diagonal navy gradient with two soft coral glows."""
    base = Image.new("RGB", (width, height), NAVY_DARK)
    top = Image.new("RGB", (width, height), NAVY)
    mask = Image.new("L", (width, height))
    mask_px = mask.load()
    for y in range(height):
        for x in range(0, width, 4):
            # blend factor follows the diagonal
            t = min(1.0, max(0.0, (x / width + y / height) / 2))
            v = int(255 * (1 - t * 0.85))
            for dx in range(4):
                if x + dx < width:
                    mask_px[x + dx, y] = v
    base = Image.composite(top, base, mask)

    glow = Image.new("RGB", (width, height), (0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.ellipse(
        [width * 0.62, height * 0.55, width * 1.25, height * 1.45],
        fill=(88, 38, 26),
    )
    glow_draw.ellipse(
        [-width * 0.2, -height * 0.35, width * 0.28, height * 0.3],
        fill=(22, 52, 84),
    )
    glow = glow.filter(ImageFilter.GaussianBlur(90))
    base = Image.blend(base, Image.composite(glow, base, glow.convert("L")), 0.9)
    return base


def social_card() -> None:
    width, height = 1200, 675
    card = gradient_bg(width, height)
    draw = ImageDraw.Draw(card)

    # subtle grid dots
    for gy in range(60, height, 60):
        for gx in range(60, width, 60):
            draw.ellipse([gx - 1, gy - 1, gx + 1, gy + 1], fill=(44, 74, 106))

    # logo on the right, floating on a soft rounded plate
    logo = Image.open(ROOT / "docs" / "logo.png").convert("RGBA")
    logo_size = 430
    logo = logo.resize((logo_size, logo_size), Image.LANCZOS)
    plate = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    plate_draw = ImageDraw.Draw(plate)
    plate_draw.rounded_rectangle(
        [700, 110, 1160, 570], radius=48, fill=(255, 255, 255, 14)
    )
    card = Image.alpha_composite(card.convert("RGBA"), plate).convert("RGB")
    card.paste(logo, (715, 125), logo)

    draw = ImageDraw.Draw(card)
    bold = ImageFont.truetype(
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 92
    )
    mono = ImageFont.truetype(
        "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf", 40
    )
    small = ImageFont.truetype(
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 34
    )

    # accent bar + wordmark
    draw.rounded_rectangle([80, 130, 104, 330], radius=12, fill=CORAL)
    draw.text((140, 130), "Readma", font=bold, fill=WHITE)
    draw.text(
        (143, 244),
        "Beautiful, effortless",
        font=small,
        fill=(168, 190, 210),
    )
    draw.text((143, 290), "README generator", font=small, fill=(168, 190, 210))

    # install snippet chip
    draw.rounded_rectangle([80, 400, 640, 490], radius=18, fill=(10, 27, 47))
    draw.rounded_rectangle(
        [80, 400, 640, 490], radius=18, outline=(58, 90, 122), width=2
    )
    draw.text((108, 424), "deno add @readma/cli", font=mono, fill=CORAL_LIGHT)

    draw.text((83, 540), "deno 2+  ·  TypeScript  ·  MIT  ·  100% tested", font=small, fill=(120, 148, 175))

    card.save(IMG / "social-card.png", quality=95)
    print("social-card.png generated")


def favicon() -> None:
    logo = Image.open(IMG / "logo.png").convert("RGBA")
    # trim transparent borders then square pad
    bbox = logo.getbbox()
    logo = logo.crop(bbox)
    side = max(logo.size)
    square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    square.paste(logo, ((side - logo.width) // 2, (side - logo.height) // 2))
    sizes = [(16, 16), (32, 32), (48, 48)]
    frames = [
        square.resize(s, Image.LANCZOS) for s in [(48, 48), (32, 32), (16, 16)]
    ]
    frames[0].save(IMG / "favicon.ico", format="ICO", sizes=sizes)
    print("favicon.ico generated")


if __name__ == "__main__":
    copy_logo()
    social_card()
    favicon()
