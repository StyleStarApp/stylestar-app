// The Star of the Week's product photo, for render harnesses only.
//
// ⚠️ DELIBERATELY NOT COMMITTED — see .gitignore. This repo is PUBLIC, and a
// retailer's product photograph is their copyrighted work. The affiliate
// approval that licenses the APP to display it (by hotlinking, gated on
// _affMid) does not clearly cover redistributing a copy of the image file
// from a public repository. Technical access is not legal permission — the
// standing rule from 2026-08-20. So the file is fetched on demand and kept
// out of git.
//
// This sandbox's Chromium cannot reach retail CDNs, so renders must serve a
// local copy; curl CAN reach them. Hence: fetch once with curl, serve locally.
import fs from 'fs';
import { execFileSync } from 'child_process';

const FILE = 'scratchpad/dvf-scarf.jpg';
const URL = 'https://www.dvf.com/cdn/shop/files/A001AMBERYSKTL_A1_2.jpg?v=1776264943&width=800';

export function starPhoto() {
  if (!fs.existsSync(FILE)) {
    console.log('fetching the Star photo (not in git, by design)...');
    execFileSync('curl', ['-sL', '--max-time', '45', '-o', FILE, URL]);
  }
  return fs.readFileSync(FILE);
}
