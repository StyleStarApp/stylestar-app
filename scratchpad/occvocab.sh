#!/bin/bash
# Which occasion phrases does a real department store treat as its OWN category?
# Dillard's is server-rendered so the answer is readable. Control included.
for t in "mother of the bride dress" "mother of the groom dress" "wedding guest dress" \
         "cocktail dress" "black tie dress" "bridesmaid dress" "prom dress" \
         "gala dress" "formal dress" "zqxwvu dress"; do
  curl -sL -o /tmp/o.html --max-time 25 "https://www.dillards.com/search-term/$(echo "$t"|sed 's/ /%20/g')" 2>/dev/null
  key=$(echo "$t" | sed 's/ dress$//')
  n=$(grep -o -i "$key" /tmp/o.html | wc -l)
  g=$(grep -o -i 'gown' /tmp/o.html | wc -l)
  printf '  %-26s own-phrase x%-5s gown x%-6s bytes %s\n' "$t" "$n" "$g" "$(wc -c </tmp/o.html)"
done
