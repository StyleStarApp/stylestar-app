#!/bin/bash
# Does "mother of the bride dress" actually work as a store search, or does the
# 5-word pileup the app's own rules warn about make it WORSE than the 4-word
# version? Nonsense-word control included (Cath's standing rule 2026-08-20):
# if gibberish returns the same shape, the reading is worthless.
probe(){ # $1=label $2=url
  curl -sL -o /tmp/p.html --max-time 25 "$2" 2>/dev/null
  local n=$(grep -o -i 'mother of the bride' /tmp/p.html | wc -l)
  local g=$(grep -o -i 'gown' /tmp/p.html | wc -l)
  local d=$(grep -o -i 'dress' /tmp/p.html | wc -l)
  printf '  %-34s bytes %-8s "mother of the bride" x%-4s "gown" x%-4s "dress" x%s\n' \
    "$1" "$(wc -c </tmp/p.html)" "$n" "$g" "$d"
}
echo "DILLARD'S (server-rendered, readable)"
probe "mother of the bride dress"  "https://www.dillards.com/search-term/mother%20of%20the%20bride%20dress"
probe "occasion midi dress (today)" "https://www.dillards.com/search-term/occasion%20midi%20dress"
probe "chiffon midi dress (today)"  "https://www.dillards.com/search-term/chiffon%20midi%20dress"
probe "CONTROL zqxwvu dress"        "https://www.dillards.com/search-term/zqxwvu%20dress"
echo
echo "TALBOTS"
probe "mother of the bride dress"  "https://www.talbots.com/search?q=mother%20of%20the%20bride%20dress"
probe "occasion midi dress (today)" "https://www.talbots.com/search?q=occasion%20midi%20dress"
probe "CONTROL zqxwvu dress"        "https://www.talbots.com/search?q=zqxwvu%20dress"
echo
echo "NORDSTROM"
probe "mother of the bride dress"  "https://www.nordstrom.com/sr?keyword=mother%20of%20the%20bride%20dress"
probe "occasion midi dress (today)" "https://www.nordstrom.com/sr?keyword=occasion%20midi%20dress"
probe "CONTROL zqxwvu dress"        "https://www.nordstrom.com/sr?keyword=zqxwvu%20dress"
