# Pixel-diff the before/after render sweep. The bar for the CSS extraction is
# that it is INVISIBLE to a human, so every pair must come back identical.
import os, sys
from PIL import Image, ImageChops

B, A = 'scratchpad/cssx/before', 'scratchpad/cssx/after'
names = sorted(os.listdir(B))
worst = []
same = diff = missing = 0
for n in names:
    fb, fa = os.path.join(B, n), os.path.join(A, n)
    if not os.path.exists(fa):
        print(f'  MISSING in after: {n}'); missing += 1; continue
    ib, ia = Image.open(fb).convert('RGB'), Image.open(fa).convert('RGB')
    if ib.size != ia.size:
        print(f'  ✗ {n:<22} SIZE differs {ib.size} -> {ia.size}')
        worst.append((n, 'size', ib.size, ia.size)); diff += 1; continue
    d = ImageChops.difference(ib, ia)
    bbox = d.getbbox()
    if bbox is None:
        same += 1
        continue
    # How many pixels actually differ, and by how much
    px = sum(1 for p in d.getdata() if p != (0, 0, 0))
    mx = max(max(p) for p in d.getdata())
    total = ib.size[0] * ib.size[1]
    print(f'  ✗ {n:<22} {px} px differ ({100*px/total:.4f}%), max channel delta {mx}, bbox {bbox}')
    worst.append((n, px, mx, bbox)); diff += 1

print()
print(f'{len(names)} pairs: {same} pixel-identical, {diff} differ, {missing} missing')
sys.exit(1 if (diff or missing) else 0)
