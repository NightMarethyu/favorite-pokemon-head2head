#!/usr/bin/env python3
"""
Bulbapedia scraper for favorite-pokemon-head2head.

For every Pokémon in pokemon_modified.json this fills in:
  - "generation": int (e.g. 1 for Generation I)
  - "games":      list of main-series games where the Pokémon can be obtained
and downloads a sprite (the Pokémon HOME render, falling back to official artwork).

Pokémon that aren't in the JSON yet get a new entry in the same format
(names, types, base stats, species, Pokédex description, profile). Their
"evolution" is left empty ({}) because Bulbapedia's evolution layouts vary too
much to parse reliably.

How it crawls: starts at Bulbasaur, reads the National Dex number from the page,
matches it to the JSON entry with the same "id", then follows the "#000N: Name ->"
link to the next Pokémon until there is no next link (the end of the National Dex).

Fetched pages are cached in .bulbapedia_cache next to this script, so re-runs
(after a crash, or to tweak parsing) don't hit Bulbapedia again.

Usage:
    pip install requests beautifulsoup4 lxml
    python scrape_bulbapedia.py              # full run
    python scrape_bulbapedia.py --limit 5    # test on the first 5 Pokémon
    python scrape_bulbapedia.py --force      # re-scrape entries that already have data
    python scrape_bulbapedia.py --max-id 1025  # stop after a given dex number
"""

import argparse
import hashlib
import json
import re
import shutil
import sys
import time
from pathlib import Path
from urllib.parse import unquote, urljoin

import requests
from bs4 import BeautifulSoup

# --- Paths -------------------------------------------------------------------
JSON_PATH = Path(r"C:\CodeBase\favorite-pokemon-head2head\src\data\pokemon_modified.json")
SPRITE_DIR = Path(r"C:\CodeBase\favorite-pokemon-head2head\src\assets\images\sprites")
CACHE_DIR = Path(__file__).resolve().with_name(".bulbapedia_cache")

# --- Crawl settings ----------------------------------------------------------
BASE = "https://bulbapedia.bulbagarden.net"
START_URL = BASE + "/wiki/Bulbasaur_(Pok%C3%A9mon)"
DELAY_SECONDS = 1.5          # pause between network requests (be polite to a fan wiki)
SAVE_EVERY = 25              # write the JSON to disk every N Pokémon
SPRITE_NAME = "{id:04d}{ext}"  # e.g. 0001.png
HEADERS = {
    # Put a real contact in here; wikis are much friendlier to identifiable bots.
    "User-Agent": "favorite-pokemon-head2head data script (personal project; contact: ammon42@gmail.com)"
}

try:
    import lxml  # noqa: F401
    PARSER = "lxml"
except ImportError:
    PARSER = "html.parser"

# The "Game locations" table mixes real games with DLC and transfer features.
# Map those labels onto the base game(s); anything not listed is kept as-is.
LABEL_MAP = {
    "Pal Park": [],  # a transfer feature, not a game
    "Expansion Pass": ["Sword", "Shield"],
    "The Isle of Armor": ["Sword", "Shield"],
    "The Crown Tundra": ["Sword", "Shield"],
    "The Hidden Treasure of Area Zero": ["Scarlet", "Violet"],
    "The Teal Mask": ["Scarlet", "Violet"],
    "The Indigo Disk": ["Scarlet", "Violet"],
    "Mega Dimension": ["Legends: Z-A"],
}


# --- Networking --------------------------------------------------------------
def http_get(session, url, **kwargs):
    """GET with simple backoff on rate limiting / server errors."""
    for attempt in range(4):
        resp = session.get(url, timeout=30, **kwargs)
        if resp.status_code == 200:
            return resp
        if resp.status_code == 403:
            sys.exit(
                f"403 Forbidden for {url}\n"
                "Bulbapedia's Cloudflare protection is probably blocking the script. "
                "Try again later, slow DELAY_SECONDS down, or open the page in a browser first."
            )
        if resp.status_code in (429, 500, 502, 503, 504):
            wait = 15 * (attempt + 1)
            print(f"  HTTP {resp.status_code}, waiting {wait}s before retrying...")
            time.sleep(wait)
            continue
        resp.raise_for_status()
    resp.raise_for_status()
    return resp


def cache_path(url):
    readable = re.sub(r"[^A-Za-z0-9_.-]", "_", unquote(url.rsplit("/", 1)[-1]))[:60]
    digest = hashlib.md5(url.encode("utf-8")).hexdigest()[:10]
    return CACHE_DIR / f"{readable}_{digest}.html"


def fetch_html(session, url):
    path = cache_path(url)
    if path.exists():
        return path.read_text(encoding="utf-8")
    resp = http_get(session, url)
    path.write_text(resp.text, encoding="utf-8")
    time.sleep(DELAY_SECONDS)
    return resp.text


def download_file(session, url, dest):
    resp = http_get(session, url)
    dest.write_bytes(resp.content)
    time.sleep(DELAY_SECONDS)


# --- Parsing -----------------------------------------------------------------
def roman_to_int(numeral):
    values = {"I": 1, "V": 5, "X": 10, "L": 50}
    total = 0
    for i, ch in enumerate(numeral):
        v = values[ch]
        if i + 1 < len(numeral) and values[numeral[i + 1]] > v:
            total -= v
        else:
            total += v
    return total


def parse_title(soup):
    h1 = soup.find(id="firstHeading")
    title = h1.get_text(strip=True) if h1 else ""
    return title.removesuffix(" (Pokémon)")


def parse_dex_number(soup):
    """The '#0001' in the infobox header."""
    infobox = soup.select_one("table.infobox")
    if infobox:
        for a in infobox.select('a[title="List of Pokémon by National Pokédex number"]'):
            m = re.fullmatch(r"#(\d+)", a.get_text(strip=True))
            if m:
                return int(m.group(1))
    return None


def parse_next_url(soup, dex):
    """The nav bar link that reads '#0002: Ivysaur'."""
    content = soup.select_one("div.mw-parser-output") or soup
    for a in content.find_all("a", href=True):
        m = re.match(r"#(\d+):", a.get_text(strip=True))
        if m and int(m.group(1)) == dex + 1:
            return urljoin(BASE, a["href"])
    return None


def parse_generation(soup):
    # Primary: the "Generation I Pokémon" category at the bottom of the page.
    for a in soup.select("#catlinks a"):
        m = re.fullmatch(r"Generation ([IVXL]+) Pokémon", a.get_text(strip=True))
        if m:
            return roman_to_int(m.group(1))
    # Fallback: "... introduced in Generation I." in the intro.
    content = soup.select_one("div.mw-parser-output") or soup
    for p in content.find_all("p", limit=4):
        m = re.search(r"introduced in Generation ([IVXL]+)", p.get_text(" ", strip=True))
        if m:
            return roman_to_int(m.group(1))
    return None


def parse_games(soup):
    """Main-series games from the 'Game locations' table, skipping 'Unobtainable'."""
    anchor = soup.find(id="Game_locations")
    if not anchor:
        return []
    heading = anchor.find_parent(["h2", "h3", "h4"]) or anchor
    table = heading.find_next("table")
    if not table:
        return []

    games = []
    for tr in table.find_all("tr"):
        ths = tr.find_all("th", recursive=False)
        tds = tr.find_all("td", recursive=False)
        if not ths or not tds:
            continue
        labels = [th.get_text(" ", strip=True) for th in ths]
        if any(label.startswith("Generation") for label in labels):
            continue  # generation header row
        location = tds[-1].get_text(" ", strip=True)
        if not location or location.lower().startswith("unobtainable"):
            continue
        for label in labels:
            for game in LABEL_MAP.get(label, [label]):
                if game not in games:
                    games.append(game)
    return games


def thumb_to_original(src):
    """.../upload/thumb/9/9f/HOME0001.png/200px-HOME0001.png -> .../upload/9/9f/HOME0001.png"""
    src = urljoin(BASE, src)
    m = re.match(r"(.*?/media/upload/)thumb/(.+)/[^/]+$", src)
    return m.group(1) + m.group(2) if m else src


def parse_sprite_url(soup, dex):
    # Preferred: the Pokémon HOME render in the Sprites section (consistent style, 512px).
    link = soup.find("a", href=f"/wiki/File:HOME{dex:04d}.png")
    if link and link.img and link.img.get("src"):
        return thumb_to_original(link.img["src"])
    # Fallback: full-size official artwork from the page metadata.
    og = soup.find("meta", property="og:image")
    if og and og.get("content"):
        return og["content"]
    return None


# --- Parsing: full entries for Pokémon not yet in the JSON -------------------
STAT_NAMES = {
    "HP": "HP", "Attack": "Attack", "Defense": "Defense",
    "Sp. Atk": "Sp. Attack", "Sp. Def": "Sp. Defense", "Speed": "Speed",
}


def is_visible(tag, stop):
    """False if tag or any ancestor up to `stop` is hidden with display:none."""
    node = tag
    while node is not None:
        style = (node.get("style") or "").replace(" ", "").lower()
        if "display:none" in style:
            return False
        if node is stop:
            return True
        node = node.parent
    return True


def infobox_section(infobox, title):
    """The infobox cell whose header links to the page `title` (e.g. 'Type')."""
    a = infobox.find("a", title=title)
    return a.find_parent("td") if a else None


def parse_types(infobox):
    section = infobox_section(infobox, "Type")
    if not section or not section.table:
        return []
    first_row = section.table.find("tr")
    for td in first_row.find_all("td", recursive=False):
        if is_visible(td, section):
            return [a.get_text(strip=True) for a in td.find_all("a", title=re.compile(r"\(type\)$"))
                    if is_visible(a, section)]
    return []


def parse_abilities(infobox):
    section = infobox_section(infobox, "Ability")
    if not section or not section.table:
        return []
    abilities = []
    for td in section.table.find("tr").find_all("td", recursive=False):
        if not is_visible(td, section) or not td.a:
            continue
        hidden = "Hidden Ability" in td.get_text(" ", strip=True)
        abilities.append([td.a.get_text(strip=True), "true" if hidden else "false"])
    return abilities


def parse_measure(infobox, title, unit):
    """First visible metric value, e.g. '0.7 m' or '6.9 kg'."""
    section = infobox_section(infobox, title)
    if not section:
        return None
    for td in section.find_all("td"):
        text = td.get_text(" ", strip=True)
        if is_visible(td, section) and re.fullmatch(rf"\d+(?:\.\d+)? {unit}", text):
            return text
    return None


def parse_gender(infobox):
    section = infobox_section(infobox, "List of Pokémon by gender ratio")
    if not section:
        return None
    text = " ".join(s.strip() for s in section.find_all(string=True)
                    if s.strip() and is_visible(s.parent, section))
    male = re.search(r"([\d.]+)% male", text)
    female = re.search(r"([\d.]+)% female", text)
    if male or female:
        return f"{male.group(1) if male else '0'}:{female.group(1) if female else '0'}"
    return "Genderless"


def parse_base_stats(soup):
    anchor = soup.find(id="Base_stats")
    table = (anchor.find_parent(["h3", "h4", "h5"]) or anchor).find_next("table") if anchor else None
    stats = {}
    if table:
        for th in table.find_all("th"):
            divs = th.find_all("div", recursive=False)
            if len(divs) == 2:
                label = divs[0].get_text(strip=True).rstrip(":")
                if label in STAT_NAMES and STAT_NAMES[label] not in stats:
                    stats[STAT_NAMES[label]] = int(divs[1].get_text(strip=True))
    return stats


def parse_other_names(soup):
    """French and (simplified) Chinese names from 'In other languages'."""
    names = {"french": None, "chinese": None}
    anchor = soup.find(id="In_other_languages")
    table = (anchor.find_parent(["h2", "h3"]) or anchor).find_next("table") if anchor else None
    if not table:
        return names
    for tr in table.find_all("tr"):
        tds = tr.find_all("td", recursive=False)
        if len(tds) < 2:
            continue
        language = tds[0].get_text(" ", strip=True)
        title_td = BeautifulSoup(str(tds[1]), PARSER)
        for tag in title_td.find_all(["i", "sup"]):
            tag.decompose()
        title = title_td.get_text(" ", strip=True)
        if language.startswith("French") and not names["french"]:
            names["french"] = title
        elif language.startswith("Mandarin") and not names["chinese"]:
            # "妙蛙種子 / 妙蛙种子" -> traditional / simplified; keep simplified.
            names["chinese"] = title.split("/")[-1].strip()
    return names


def parse_description(soup):
    """Most recent main-series Pokédex entry."""
    anchor = soup.find(id="Pokédex_entries")
    table = (anchor.find_parent(["h3", "h4"]) or anchor).find_next("table") if anchor else None
    if not table:
        return None
    entries = []
    for gen_table in table.select(":scope > tbody > tr > td > table, :scope > tr > td > table"):
        header = gen_table.find("th")
        if header and header.get_text(strip=True).startswith("Spin-off"):
            continue
        for td in gen_table.find_all("td", class_="roundy"):
            if "vertical-align" not in (td.get("style") or ""):
                continue
            text = td.get_text(" ", strip=True)
            text = re.sub(r"\s+([.,!?])", r"\1", text)  # 'Pok é mon' artifacts from <span class=sc>
            if text and not text.startswith("("):
                entries.append(text)
    return entries[-1] if entries else None


def build_entry(soup, dex):
    infobox = soup.select_one("table.infobox")
    ja = infobox.select_one('span[lang="ja"] b') if infobox else None
    category = infobox.find("a", title="Pokémon category") if infobox else None
    other = parse_other_names(soup)
    return {
        "id": dex,
        "name": {
            "english": parse_title(soup),
            "japanese": ja.get_text(strip=True) if ja else None,
            "chinese": other["chinese"],
            "french": other["french"],
        },
        "type": parse_types(infobox) if infobox else [],
        "base": parse_base_stats(soup),
        "species": category.get_text(strip=True) if category else None,
        "description": parse_description(soup),
        "evolution": {},
        "profile": {
            "height": parse_measure(infobox, "List of Pokémon by height", "m") if infobox else None,
            "weight": parse_measure(infobox, "Weight", "kg") if infobox else None,
            "egg": [a.get_text(strip=True) for a in infobox.find_all("a", title=re.compile(r"\(Egg Group\)$"))]
                   if infobox else [],
            "ability": parse_abilities(infobox) if infobox else [],
            "gender": parse_gender(infobox) if infobox else None,
        },
        "generation": parse_generation(soup),
        "games": parse_games(soup),
    }


# --- Main --------------------------------------------------------------------
def save_json(data):
    data.sort(key=lambda p: p["id"])
    tmp = JSON_PATH.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    tmp.replace(JSON_PATH)


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--limit", type=int, default=0, help="stop after N Pokémon (for testing)")
    parser.add_argument("--force", action="store_true", help="overwrite existing data and sprites")
    parser.add_argument("--max-id", type=int, default=0, help="stop after this dex number (default: end of the dex)")
    args = parser.parse_args()

    data = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    by_id = {p["id"]: p for p in data}
    original_count = len(data)

    backup = JSON_PATH.with_suffix(".json.bak")
    if not backup.exists():
        shutil.copy2(JSON_PATH, backup)
        print(f"Backed up original JSON to {backup}")

    SPRITE_DIR.mkdir(parents=True, exist_ok=True)
    CACHE_DIR.mkdir(exist_ok=True)

    session = requests.Session()
    session.headers.update(HEADERS)

    url = START_URL
    processed = 0
    warnings = []

    try:
        while url:
            soup = BeautifulSoup(fetch_html(session, url), PARSER)
            dex = parse_dex_number(soup)
            if dex is None:
                warnings.append(f"Couldn't read a dex number at {url}; stopping.")
                break

            entry = by_id.get(dex)
            if entry is None:
                entry = build_entry(soup, dex)
                data.append(entry)
                by_id[dex] = entry
                print(f"  + new entry for #{dex:04d} {entry['name']['english']}")
                gaps = [k for k, v in entry["name"].items() if not v]
                gaps += [k for k in ("type", "base", "species", "description") if not entry[k]]
                if gaps:
                    warnings.append(f"#{dex} {entry['name']['english']}: new entry missing {', '.join(gaps)}")

            if entry:
                name = entry["name"]["english"]
                title = parse_title(soup)
                if title and title.lower() != name.lower():
                    warnings.append(f"#{dex}: JSON says '{name}', page says '{title}'")

                if args.force or entry.get("generation") is None or entry.get("games") is None:
                    entry["generation"] = parse_generation(soup)
                    entry["games"] = parse_games(soup)
                    if entry["generation"] is None:
                        warnings.append(f"#{dex} {name}: no generation found")
                    if not entry["games"]:
                        warnings.append(f"#{dex} {name}: no games found")

                sprite_url = parse_sprite_url(soup, dex)
                if sprite_url:
                    ext = Path(sprite_url).suffix or ".png"
                    dest = SPRITE_DIR / SPRITE_NAME.format(id=dex, ext=ext)
                    if args.force or not dest.exists():
                        download_file(session, sprite_url, dest)
                else:
                    warnings.append(f"#{dex} {name}: no sprite found")

                processed += 1
                print(f"#{dex:04d} {name}: gen {entry['generation']}, {len(entry['games'] or [])} games")
                if processed % SAVE_EVERY == 0:
                    save_json(data)

            if args.limit and processed >= args.limit:
                break
            if args.max_id and dex >= args.max_id:
                break
            url = parse_next_url(soup, dex)
            if not url:
                warnings.append(f"No next link after #{dex}; stopping.")
    except KeyboardInterrupt:
        print("\nInterrupted; saving progress...")
    finally:
        save_json(data)

    missing = [p["id"] for p in data if p.get("generation") is None]
    print(f"\nDone. Processed {processed} Pokémon; added {len(data) - original_count} new entries "
          f"({len(data)} total); {len(missing)} entries still lack a generation.")
    if warnings:
        print(f"\n{len(warnings)} warnings:")
        for w in warnings:
            print("  " + w)


if __name__ == "__main__":
    main()