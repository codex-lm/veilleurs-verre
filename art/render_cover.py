#!/usr/bin/env python3
from pathlib import Path
import math
import random
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent
SCALE = 2
W, H = 1280, 720
INK = (9, 34, 40)
DEEP = (12, 47, 52)
TURQ = (67, 203, 185)
PALE = (239, 255, 249)
AMBER = (232, 168, 76)
PLUM = (143, 78, 120)

image = Image.new("RGB", (W * SCALE, H * SCALE), INK)
draw = ImageDraw.Draw(image)

def point(x, y):
    return (int(x * SCALE), int(y * SCALE))

def polygon(points, fill, outline=None, width=1):
    draw.polygon([point(x, y) for x, y in points], fill=fill)
    if outline:
        draw.line([point(x, y) for x, y in points + [points[0]]], fill=outline, width=width * SCALE, joint="curve")

def line(points, fill, width=1):
    draw.line([point(x, y) for x, y in points], fill=fill, width=width * SCALE, joint="curve")

def ellipse(box, fill, outline=None, width=1):
    draw.ellipse(tuple(v * SCALE for v in box), fill=fill, outline=outline, width=width * SCALE)

def rectangle(box, fill, radius=0, outline=None, width=1):
    draw.rounded_rectangle(tuple(v * SCALE for v in box), radius=radius * SCALE, fill=fill, outline=outline, width=width * SCALE)

def font(size, serif=True, bold=False):
    names = [
        "C:/Windows/Fonts/georgia.ttf" if serif else "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/georgiab.ttf" if serif and bold else "C:/Windows/Fonts/arialbd.ttf",
        "DejaVuSerif.ttf" if serif else "DejaVuSans.ttf",
    ]
    for name in names:
        try:
            return ImageFont.truetype(name, size * SCALE)
        except OSError:
            pass
    return ImageFont.load_default(size=size * SCALE)

def text(x, y, value, size, fill, serif=True, bold=False):
    draw.text(point(x, y), value, font=font(size, serif, bold), fill=fill)

for y in range(H * SCALE):
    ratio = y / (H * SCALE)
    color = tuple(int(DEEP[i] * (1 - ratio) + INK[i] * ratio) for i in range(3))
    draw.line([(0, y), (W * SCALE, y)], fill=color)

random.seed(47)
for _ in range(750):
    x = random.randrange(W * SCALE)
    y = random.randrange(H * SCALE)
    shade = random.choice([(24, 62, 65), (16, 53, 58), (30, 68, 69)])
    draw.point((x, y), fill=shade)

for radius in (275, 225, 175):
    ellipse((890 - radius, 338 - radius, 890 + radius, 338 + radius), None, (32, 80, 80), 1)

beam = Image.new("RGBA", image.size, (0, 0, 0, 0))
beam_draw = ImageDraw.Draw(beam)
beam_draw.polygon([point(895, 128), point(490, 285), point(490, 400)], fill=(*AMBER, 35))
beam_draw.polygon([point(895, 128), point(1215, 245), point(1215, 335)], fill=(*TURQ, 26))
beam = beam.filter(ImageFilter.GaussianBlur(15 * SCALE))
image = Image.alpha_composite(image.convert("RGBA"), beam).convert("RGB")
draw = ImageDraw.Draw(image)

for x, y, w, h in [(565, 500, 120, 70), (690, 535, 150, 48), (1040, 520, 150, 75), (840, 560, 95, 40)]:
    rectangle((x, y, x + w, y + h), (32, 70, 69), 7, (61, 100, 94), 2)
    line([(x + 15, y + 12), (x + w - 18, y + 12)], (63, 101, 94), 2)

for x, y in [(585, 520), (742, 570), (1135, 540), (800, 594), (1190, 585)]:
    line([(x, y), (x - 4, y - 26), (x - 15, y - 38)], (50, 111, 93), 3)
    line([(x - 4, y - 19), (x + 11, y - 32)], (50, 111, 93), 3)

for x, y in [(605, 275), (1165, 410), (760, 180), (1060, 610)]:
    polygon([(x, y - 15), (x + 10, y), (x, y + 15), (x - 10, y)], TURQ, PALE, 1)

rectangle((856, 200, 946, 512), (22, 59, 62), 8, (91, 133, 122), 2)
polygon([(856, 200), (876, 176), (925, 176), (946, 200)], PLUM, (220, 163, 201), 2)
rectangle((865, 132, 937, 180), (37, 83, 82), 5, PALE, 2)
rectangle((878, 105, 924, 134), TURQ, 3, PALE, 2)
polygon([(871, 105), (880, 82), (922, 82), (932, 105)], INK, AMBER, 2)
line([(901, 82), (901, 57)], AMBER, 4)
line([(882, 218), (882, 474)], (57, 94, 90), 3)
line([(922, 218), (922, 474)], (11, 42, 47), 5)
rectangle((830, 505, 970, 526), (45, 80, 76), 5, (89, 123, 111), 2)

ellipse((568, 596, 1160, 644), (7, 28, 33))

def guardian(x, y, scale=1):
    def p(points):
        return [(x + a * scale, y + b * scale) for a, b in points]
    polygon(p([(28, 30), (25, 12), (38, 2), (50, 13), (54, 32)]), TURQ, PALE, 2)
    polygon(p([(26, 34), (15, 65), (24, 107), (43, 116), (60, 99), (62, 58), (50, 34)]), TURQ, PALE, 2)
    polygon(p([(34, 39), (39, 100), (25, 66)]), (182, 255, 240))
    polygon(p([(51, 46), (77, 50), (73, 82), (56, 99), (44, 79)]), PLUM, (244, 216, 235), 2)
    line(p([(23, 60), (7, 80), (15, 89), (30, 72)]), PALE, 4)
    line(p([(36, 51), (32, 65), (39, 73), (34, 88)]), PALE, 2)

def scout(x, y, scale=1):
    def p(points):
        return [(x + a * scale, y + b * scale) for a, b in points]
    polygon(p([(29, 25), (34, 5), (48, 1), (54, 24), (44, 34)]), AMBER, (255, 248, 223), 2)
    polygon(p([(32, 34), (22, 60), (31, 103), (45, 108), (58, 63), (46, 34)]), AMBER, (255, 248, 223), 2)
    polygon(p([(27, 46), (7, 86), (31, 73), (46, 50)]), PLUM, (244, 216, 235), 2)
    line(p([(55, 40), (76, 91)]), PALE, 4)
    line(p([(38, 39), (34, 81), (43, 96)]), (255, 225, 160), 3)

def artificer(x, y, scale=1):
    def p(points):
        return [(x + a * scale, y + b * scale) for a, b in points]
    polygon(p([(28, 30), (34, 10), (50, 12), (55, 33), (42, 39)]), PLUM, (255, 241, 251), 2)
    polygon(p([(30, 38), (18, 88), (29, 108), (50, 108), (61, 81), (49, 38)]), PLUM, (255, 241, 251), 2)
    polygon(p([(23, 20), (42, 2), (65, 23), (55, 29), (26, 27)]), TURQ, PALE, 2)
    line(p([(62, 20), (68, 105)]), AMBER, 4)
    polygon(p([(62, 1), (74, 16), (64, 30), (51, 16)]), TURQ, PALE, 2)
    line(p([(36, 45), (29, 80), (38, 96)]), (216, 148, 192), 3)

guardian(650, 460, 1.35)
scout(795, 500, 1.25)
artificer(1000, 475, 1.35)

rectangle((54, 54, 594, 584), (9, 34, 40), 18, (44, 91, 88), 1)
line([(82, 108), (133, 108)], TURQ, 3)
text(82, 126, "A TACTICAL CARD EXPEDITION", 14, (169, 203, 198), False, True)
text(78, 185, "THE GLASS", 67, PALE)
text(78, 265, "WARDENS", 67, PALE)
text(82, 365, "Read their intent.", 28, (216, 148, 192))
text(82, 405, "Shape the light.", 28, (216, 148, 192))
line([(82, 474), (562, 474)], (46, 88, 85), 1)
text(82, 503, "THREE HEROES  ·  FIVE STEPS  ·  ONE BEACON", 13, (169, 203, 198), False, True)
text(82, 544, "KIMI GAMES", 12, TURQ, False, True)

image = image.resize((W, H), Image.Resampling.LANCZOS)
image.save(ROOT / "cover.png", optimize=True)
print(ROOT / "cover.png")
