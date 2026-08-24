# Her own Star of the Week photographs

Photographs **Catherine took herself**, of pieces she owns, for the Star of the
Week card. Drop a file in here and name it on the queue entry:

```js
{n:'Gold Stretchy Stacking Bangles', store:'Badu · Amazon', …,
 ownPx:'stars/bangles.jpg'}
```

## Why this folder exists

The Star card's photo is normally a **retailer's** picture, hotlinked, and that
is licensed by an affiliate approval with that retailer — so it only appears for
an approved advertiser. Today that is 3 of the 19 stars, which means unfreezing
the weekly rotation would show a text-only card 16 weeks out of 19.

**A photograph she took is her own copyright.** There is nobody to ask, so
`ownPx` bypasses the affiliate gate on purpose. See the long note at
`_wkStarPxTag` in `index.html`.

## Rules

- **These files ARE committed.** That is the opposite of `scratchpad/dvf-scarf.jpg`,
  which `.gitignore` refuses — because that one is a *retailer's* file and this
  repo is public. The distinction is **ownership**, not file type.
- **Only her own photographs go here.** Never a retailer's image, never a press
  shot, never something found in a search. If she did not take it, it does not
  belong in this folder.
- Filenames must match `stars/<name>.jpg|jpeg|png|webp` — lowercase-ish, no
  spaces, no subfolders. Anything else renders **nothing** rather than a broken
  image, deliberately.
- The card draws the photo at 140px on the front door, and the frame is 3:4.
  A **portrait-ish** shot crops best; a wide one loses its sides.
