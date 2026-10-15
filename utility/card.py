"""Render the portfolio's Open Graph image from its existing SVG mark."""

from pathlib import Path
import re
import xml.etree.ElementTree as ET

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parent.parent
SVG = ROOT / "image" / "logo.svg"
OUTPUT = ROOT / "image" / "social-card.png"
SCALE = 2


def font(name, size):
    fallback = "DejaVuSerif.ttf" if name.startswith("georgia") else "DejaVuSans.ttf"
    candidates = [
        Path("C:/Windows/Fonts") / name,
        Path("/System/Library/Fonts/Supplemental") / name,
        Path("/usr/share/fonts/truetype/dejavu") / fallback,
        fallback,
    ]
    for candidate in candidates:
        try:
            return ImageFont.truetype(str(candidate), size * SCALE)
        except OSError:
            continue
    raise FileNotFoundError(f"No suitable font found for {name}")


def draw_mark(draw, paths, x, y, width, color):
    factor = width / 119
    for path in paths:
        numbers = [float(value) for value in re.findall(r"-?\d+(?:\.\d+)?", path)]
        points = [
            ((x + numbers[i] * factor) * SCALE, (y + numbers[i + 1] * factor) * SCALE)
            for i in range(0, len(numbers), 2)
        ]
        draw.polygon(points, fill=color)


def main():
    svg = ET.parse(SVG).getroot()
    paths = list(dict.fromkeys(node.attrib["d"] for node in svg if node.tag.endswith("path")))
    image = Image.new("RGB", (1200 * SCALE, 630 * SCALE), "#0b0b0b")
    draw = ImageDraw.Draw(image)

    draw_mark(draw, paths, 755, 160, 405, "#292929")
    draw_mark(draw, paths, 88, 74, 83, "#f0f0f0")
    draw.text((195 * SCALE, 91 * SCALE), "ZULFAHMI ARDIANSAH", font=font("arialbd.ttf", 24), fill="#f0f0f0")
    draw.line((88 * SCALE, 174 * SCALE, 1112 * SCALE, 174 * SCALE), fill="#474747", width=2)
    draw.text((88 * SCALE, 215 * SCALE), "Develop.", font=font("georgia.ttf", 92), fill="#f5f5f5")
    draw.text((88 * SCALE, 320 * SCALE), "Design. Data.", font=font("georgia.ttf", 92), fill="#f5f5f5")
    draw.line((88 * SCALE, 505 * SCALE, 1112 * SCALE, 505 * SCALE), fill="#474747", width=2)
    draw.text((88 * SCALE, 535 * SCALE), "WEB DEVELOPER  /  JAKARTA, INDONESIA", font=font("arial.ttf", 24), fill="#c9c9c9")

    image.resize((1200, 630), Image.Resampling.LANCZOS).save(OUTPUT, optimize=True)


if __name__ == "__main__":
    main()
