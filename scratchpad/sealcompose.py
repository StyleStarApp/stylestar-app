from PIL import Image, ImageDraw, ImageFont
import json

labels = {v["key"]: v["label"] for v in json.load(open("scratchpad/seal-labels.json"))}
order = ["live", "a", "b", "c"]

F = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
font = ImageFont.truetype(F, 34)

imgs = [Image.open(f"scratchpad/seal-{k}.png").convert("RGB") for k in order]
W = max(i.width for i in imgs)
BAR, PAD = 58, 16

H = sum(i.height + BAR + PAD for i in imgs) + PAD
out = Image.new("RGB", (W, H), (24, 24, 26))
d = ImageDraw.Draw(out)

y = PAD
for k, im in zip(order, imgs):
    d.rectangle([0, y, W, y + BAR], fill=(24, 24, 26))
    col = (255, 214, 120) if k != "live" else (170, 170, 175)
    d.text((14, y + 12), labels[k], font=font, fill=col)
    y += BAR
    out.paste(im, (0, y))
    y += im.height + PAD

out.save("scratchpad/seal-compare.png")
print("composed", out.size)
