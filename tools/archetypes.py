"""Writes the travelerStyles array in source/site/account-state.mjs from Charlie's
"Deep Spot Traveler Archetypes" list (2026-10-21).
Icons v2 (2026-10-21): one family on a 24x24 grid, stroke 2, round caps/joins,
geometry inside 2..22, at most ONE solid accent per icon (fill="currentColor").
Run: python tools/archetypes.py      (import it to read A without writing)
"""
import json, re, pathlib


def dots(*c):
    """One solid accent path made of discs, no stroke (r = drawn radius): dots((x, y, r), ...)."""
    assert all((2 * x) % 1 == 0 and (2 * y) % 1 == 0 for x, y, r in c), c
    d = ''.join(f'M{x-r:g} {y}a{r:g} {r:g} 0 1 0 {2*r:g} 0a{r:g} {r:g} 0 1 0 {-2*r:g} 0Z' for x, y, r in c)
    return f'<path fill="currentColor" stroke="none" d="{d}"/>'


def solid(d):
    """One solid accent path."""
    return f'<path fill="currentColor" d="{d}"/>'


def P(d):
    return f'<path d="{d}"/>'


A = [  # group, id, name, description, svg body (24x24, stroke 2, inherits stroke)
 ('weird & alternative','occultist','the occultist','Witchcraft, esoteric temples, curse spots, and anything with a whiff of the forbidden.',
  '<circle cx="12" cy="12" r="10"/>' + P('M12 2 18 20 2.5 9h19L6 20Z')),
 ('weird & alternative','urbex-rat','urbex rat','Abandoned hotels, hospitals, theme parks, old factories, mines and forgotten buildings.',
  P('M3 21h18M4 21V10l5 3v-3l5 3v-3l4 2.5V3h3v18') + P('M7.5 16.5v1.5M11.5 16.5v1.5M15.5 16.5v1.5')),
 ('weird & alternative','dungeon-diver','dungeon diver','Man-made underground spaces: catacombs, old tunnels, underground cities, dungeons, flood channels, and secret passages.',
  P('M2 21h20M4 21V11a8 8 0 0 1 16 0v10') + P('M8 21v-3h3v-3h3v-3h2.5')),
 ('weird & alternative','ghost-hunter','ghost hunter','Haunted places, paranormal hotspots and spots with a creepy backstory.',
  P('M5 21V10a7 7 0 0 1 14 0v11l-3.5-2-3.5 2-3.5-2Z') + dots((9.5, 10, 2), (14.5, 10, 2))),
 ('weird & alternative','monster-hunter','monster hunter','Cryptids, Bigfoot sightings, kappa ponds and anywhere a monster is said to roam.',
  P('M6.5 11.5c0-2 2-2.5 5-2.5s6 .5 6.5 2.5c.5 2.5-2 4-3 6.5-.8 2-1.5 3.5-4 3.5s-3.5-1.5-3.5-3.5c0-2-1-4.5-1-6.5Z')
  + dots((7.5, 5.5, 1.75), (11, 3.5, 1.4), (14.5, 3.5, 1.25), (17.5, 5, 1.15), (19.5, 7.5, 1))),
 ('weird & alternative','oddball','oddball','Bizarre museums, strange private collections, giant tacky statues and one-of-a-kind roadside weirdness.',
  P('M12 3c4.5 0 8 2.5 8 7 0 2.5 1.5 4 1 6.5S16.5 21 12 21s-8-1.5-8.5-4.5S4 12 4 10c0-4.5 3.5-7 8-7Z')
  + '<circle cx="9" cy="10" r="3"/>' + P('M16 9v.01M8.5 16.5l2-1 2 1.5 3-1.5') + dots((10, 10.5, 1.5))),
 ('weird & alternative','conspiracy-theorist','conspiracy theorist','UFO landing sites, conspiracy hotspots and "they don\'t want you to know" places.',
  P('M8 9.5a4 4 0 0 1 8 0') + P('M2.5 11.5C2.5 10 6.5 9 12 9s9.5 1 9.5 2.5S17.5 14 12 14s-9.5-1-9.5-2.5Z')
  + P('M8.5 14l-3 7M15.5 14l3 7M5.5 21h13') + dots((7, 11.5, 1.25), (12, 11.5, 1.25), (17, 11.5, 1.25))),
 ('weird & alternative','undertaker','the undertaker','Cemeteries, catacombs, ossuaries, funeral customs and anything to do with death and the afterlife.',
  P('M9 2.5h6L18.5 8l-3 13.5h-7L5.5 8Z') + P('M12 7v8M9.5 9.5h5')),
 ('weird & alternative','folklorist','the folklorist','Myths, local legends, yokai and the stories behind places.',
  P('M4 3l4.5 4.5h7L20 3l1 8-3 6-6 4.5L6 17l-3-6Z') + P('M8 11.5l2 1M16 11.5l-2 1') + solid('M11 17h2l-1 1.5Z')),
 ('weird & alternative','liminalist','liminalist','Empty malls, eerie hallways and in-between spaces that feel like a dream.',
  P('M3 3h18v18H3Z') + P('M9 8h6v8H9Z') + P('M3 3l6 5M21 3l-6 5M3 21l6-5M21 21l-6-5') + solid('M11 12h2v4h-2Z')),
 ('weird & alternative','mad-scientist','mad scientist','Weird science museums, eccentric inventors and experiments gone strange.',
  P('M8.5 3h7M10 3v6l-5 9.5c-.5 1 0 2.5 1.5 2.5h11c1.5 0 2-1.5 1.5-2.5L14 9V3') + P('M7 14.5h10') + dots((10.5, 18, 1.5), (14, 17.5, 1.25), (12.5, 11.5, 1))),
 ('nature & outdoors','rock-hound','rock hound','Geological formations, crystals, strange rocks and earth oddities.',
  P('M9 20V7l3-4 3 4v13') + P('M9 20H5.5L4 13l2.5-3L9 11.5M15 20h3.5L20 14l-2-3-3 1.5') + P('M3 20h18')),
 ('nature & outdoors','worm-lord','worm lord','Caves, caverns, lava tubes and natural underground adventures.',
  P('M2.5 20l3-7 3-1 2.5-5 3 1 2-2 3.5 4 1.5 3 1 7Z') + solid('M8 20v-2.5a4 4 0 0 1 8 0V20Z')),
 ('nature & outdoors','trailblazer','trailblazer','Hiking trails, mountain summits, waterfalls and multi-day treks.',
  P('M2 20 8.5 9l4 6.5L15 12l7 8Z') + P('M8.5 9V3') + solid('M8.5 3l4 1.5-4 1.5Z')),
 ('nature & outdoors','beach-bum','beach bum','Hidden beaches, remote islands, surf spots, tide pools and sea glass hunting.',
  P('M3 21c3-2 15-2 18 0') + P('M11 19.5c0-5 1.5-8.5 4-11.5') + P('M15 8C13 5.5 9.5 5 7 6.5M15 8c.5-3 3-5 6-4.5M15 8c3 0 5.5 1.5 6 4.5M15 8c-3 .5-5 2.5-5.5 5') + dots((14, 10, 1.75))),
 ('nature & outdoors','pirate','pirate','Shipwrecks, old harbors, lighthouses, sea forts and life on the open water, or nomads who travel by sea.',
  P('M3 15h18l-2.5 5.5h-13Z') + P('M12 2.5V15M12 5l6.5 8H12M12 7l-5.5 6H12') + solid('M12 2.5H8.5l1 1.5-1 1.5H12Z')),
 ('nature & outdoors','hot-spring-hunter','hot spring hunter','Hot springs, natural baths, saunas and old bathhouses.',
  P('M8 13.5c-2.5.5-4.5 1.5-4.5 3 0 2.5 3.8 4.5 8.5 4.5s8.5-2 8.5-4.5c0-1.5-2-2.5-4.5-3')
  + P('M8 14c-1.5-1.5 1.5-3 0-4.5S9.5 6.5 8 5M12 15c-1.5-1.5 1.5-3 0-4.5S13.5 7 12 5.5 13.5 3 12 3M16 14c-1.5-1.5 1.5-3 0-4.5S17.5 6.5 16 5')),
 ('nature & outdoors','happy-camper','happy camper','Campsites, glamping, off-grid spots and sleeping under the stars.',
  P('M2.5 20h19M12 6.5 4 20M12 6.5 20 20M12 6.5 10 3.5M12 6.5l2-3') + solid('M12 13l3.5 7h-7Z')),
 ('history & culture','archaeologist','archaeologist','Ancient ruins, lost cities, rock art and the crumbling remains of past civilizations.',
  P('M3 8 12 3.5l3 1.5-1 1.5L15.5 8Z') + P('M5 8v12M9 8v12M13 8v12M17.5 20v-4l1-1 1 1.5V20M2.5 20h19')),
 ('history & culture','prophet','the prophet','Holy sites, temples, shrines, churches, cathedrals and sacred buildings of every faith.',
  P('M2.5 4.5c3 1 16 1 19 0') + P('M5 9h14M7 5.5V21M17 5.5V21M12 6V9')),
 ('history & culture','history-buff','the history buff','Historic landmarks, castles, old towns and the stories that shaped a place.',
  P('M3 21V6h2v2h2V6h2v5h6V6h2v2h2V6h2v15Z') + P('M10 21v-4a2 2 0 0 1 4 0v4')),
 ('history & culture','warlord','warlord','Battlefields, war memorials, military museums, bunkers and Cold War relics.',
  P('M3.5 3.5 14 14M12.5 15.5l3-3M14 14l4 4M20.5 3.5 10 14M8.5 12.5l3 3M10 14l-4 4') + dots((19, 19, 2.25), (5, 19, 2.25))),
 ('history & culture','museum-snob','museum snob','Museums of every kind, from world-famous collections to tiny one-room oddities.',
  P('M8 2.5h8v9.5H8Z') + P('M4 21v-7M20 21v-7M2.5 21h3M18.5 21h3M4 15.5c3.5 3 12.5 3 16 0') + dots((4, 13, 1.75), (20, 13, 1.75))),
 ('history & culture','anthropologist','the anthropologist','Local customs, rituals, festivals, traditional crafts and how people actually live.',
  P('M9 3h6v2H9ZM9 19h6v2H9Z') + P('M12 5c4.5 0 7.5 3 7.5 7s-3 7-7.5 7-7.5-3-7.5-7 3-7 7.5-7Z') + P('M5.5 9.5h13M5.5 14.5h13')),
 ('history & culture','prospector','prospector','Ghost towns, old mines, gold rush sites and abandoned boomtowns.',
  P('M4 20 14.5 9.5') + P('M5 5.5a14 14 0 0 1 13.5 13.5') + solid('M11.5 21l.5-2 2-1 2 1.5-.5 1.5Z')),
 ('history & culture','jailbird','jailbird','Old prisons, jails, torture museums and the darker side of crime and punishment.',
  P('M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z') + P('M8.5 3v18M12 3v18M15.5 3v18')),
 ('food & drink','decadent-gourmand','decadent gourmand','Fine dining, legendary restaurants and food and drink worth traveling for.',
  P('M4 17a8 8 0 0 1 16 0Z') + P('M2.5 20h19') + P('M8 13.5a4.5 4.5 0 0 1 2.5-2.5') + dots((12, 7, 2.25))),
 ('food & drink','taboo-gourmand','taboo gourmand','Offal, insects, extreme dishes and adventurous eating.',
  P('M12 8c3 0 5 2.5 5 6.5S15 21 12 21s-5-2.5-5-6.5S9 8 12 8Z') + P('M12 11v10M10.5 5.5 8.5 2.5M13.5 5.5l2-3')
  + P('M7 11 4 9.5M7 14.5H3.5M7.5 18l-3 2M17 11l3-1.5M17 14.5h3.5M16.5 18l3 2') + solid('M9.5 8a2.5 2.5 0 0 1 5 0Z')),
 ('food & drink','forager','forager','Street food, night markets, food stalls and snacking your way through a city.',
  P('M4.5 9h15l-2 12h-11Z') + P('M4.5 9 3.5 6h5l1 3M19.5 9l1-3h-5l-1 3') + P('M12 9l4-6.5M15.5 9l4.5-5.5') + P('M7 13.5h10')),
 ('nightlife & social','night-goblin','night goblin','Clubs, karaoke, live music and whatever\'s happening after dark.',
  '<circle cx="15" cy="9" r="4.5"/>' + P('M12.5 6.5l5 5') + solid('M11.5 11 13 12.5 5.5 20a1 1 0 0 1-1.5-1.5Z')),
 ('nightlife & social','pub-crawler','pub crawler','Pubs, taverns, dive bars and a local drink in every town.',
  P('M5 8.5h10v11a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 5 19.5Z') + P('M15 10.5h2.5a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H15') + P('M8.5 12v6M11.5 12v6')
  + solid('M4.5 8.5C4 6 5.5 4.5 7.5 5c1-2 4-2.5 5.5-.5 2-1 4 .5 3.5 2.5 0 .5-.2 1-.5 1.5Z')),
 ('science & tech','science-geek','science geek','Science museums, research centers, labs and hands-on discovery.',
  '<ellipse cx="12" cy="12" rx="9.5" ry="3.5"/><ellipse cx="12" cy="12" rx="9.5" ry="3.5" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9.5" ry="3.5" transform="rotate(120 12 12)"/>' + dots((12, 12, 2.5))),
 ('science & tech','astronaut','astronaut','Observatories, planetariums, dark-sky spots, rocket launch sites, space centers, meteor craters and anything to do with going to space.',
  P('M12 2c3 2.5 4.5 6 4.5 10.5v4h-9v-4C7.5 8 9 4.5 12 2Z') + '<circle cx="12" cy="9.5" r="1.75"/>' + P('M7.5 12 4.5 15v3.5l3-2M16.5 12l3 3v3.5l-3-2') + solid('M10 18.5h4L12 22Z')),
 ('science & tech','grease-monkey','grease monkey','Trains, planes, cars and unusual rides: railways, aviation museums, motorsport, cable cars and funiculars.',
  P('M7 2.5h10a3 3 0 0 1 3 3V15a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V5.5a3 3 0 0 1 3-3Z') + P('M7 5.5h10V10H7Z') + P('M7.5 18 5 21.5M16.5 18l2.5 3.5') + dots((8, 14, 2), (16, 14, 2))),
 ('science & tech','bureaucrat','the bureaucrat','Dams, bridges, power plants and the giant public works that keep everything running.',
  P('M6 20V4M18 20V4M2 14h20') + P('M2 8.5c2 0 3.5-1.5 4-4.5 1.5 7 10.5 7 12 0 .5 3 2 4.5 4 4.5') + P('M10 14v-3M14 14v-3')),
 ('science & tech','futurist','futurist','Robots, cutting-edge tech and visions of the future.',
  P('M7 8h10a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z') + P('M12 8V5M12 3v.01M3 12v3M21 12v3M9.5 16h5') + dots((9, 12.5, 2.25), (15, 12.5, 2.25))),
 ('science & tech','botanist','the botanist','Botanical gardens, greenhouses and rare plants.',
  P('M6 13.5h12v2.5H6ZM7 16l1 5h8l1-5') + P('M12 13.5V8') + P('M12 9C12 6 10 4 6 4c0 3.5 2.5 5 6 5Z') + solid('M12 10.5c0-2.5 2-4.5 5.5-4.5 0 3-2 4.5-5.5 4.5Z')),
 ('art & design','artsy-fartsy','artsy fartsy','Art galleries, exhibitions, street art, murals and public installations.',
  P('M12 3c5 0 9 3.5 9 7.5 0 3-2.5 3.5-4.5 3.5-1.5 0-2.5 1-2.5 2.5S15 19 13 20.5c-1 .7-2.5.5-4 0C5.5 19 3 16 3 12c0-5 4-9 9-9Z') + '<circle cx="8.5" cy="15.5" r="1.25"/>'
  + dots((8, 9.5, 2), (12, 7, 2), (16, 8.5, 2))),
 ('art & design','weeb','weeb','Real-world anime and manga locations, plus arcades, gacha machines and otaku hotspots.',
  P('M4 17h16l-1.5 4h-13Z') + P('M12 17V9.5M17 17v-1.5') + dots((12, 7, 3.75))),
 ('art & design','bookworm','bookworm','Bookstores, libraries and literary landmarks.',
  P('M2.5 5.5c3-1 6.5-1 9.5 1.5 3-2.5 6.5-2.5 9.5-1.5v13c-3-1-6.5-1-9.5 1.5-3-2.5-6.5-2.5-9.5-1.5Z') + P('M12 7v13') + solid('M15.5 5.5v5l1.5-1 1.5 1v-5Z')),
 ('art & design','architect','the architect','Architecture and design, from brutalist concrete and modern landmarks to beautiful interiors and signage.',
  P('M4 3v17h17Z') + P('M8 11v5h5Z') + P('M4 7h2M4 11h2M4 15h2')),
 ('wellness & spirit','mystic','the mystic','Power spots, sacred energy sites, meditation retreats and spiritual places.',
  P('M12 16c-2-2-3-6-6.5-7.5-.5 4 1.5 7 6.5 7.5Zm0 0c2-2 3-6 6.5-7.5.5 4-1.5 7-6.5 7.5Z') + P('M12 16c-3 .5-6 0-9-2 1.5 3 5 4.5 9 4.5s7.5-1.5 9-4.5c-3 2-6 2.5-9 2Z')
  + solid('M12 5c2.5 2.5 3 6 0 11-3-5-2.5-8.5 0-11Z')),
 ('extra','adrenaline-junkie','adrenaline junkie','Bungee, ziplines, rafting, diving, skiing and anything that gets the heart racing.',
  P('M3 10a9 7 0 0 1 18 0c-1.5-1-3-1-4.5 0-1.5-1-3-1-4.5 0-1.5-1-3-1-4.5 0-1.5-1-3-1-4.5 0Z') + P('M3 10l8 8.5M21 10l-8 8.5M7.5 10l3.5 8.5M16.5 10 13 18.5') + solid('M10.5 18.5h3v3h-3Z')),
 ('extra','nomad','nomad','Long-term wanderers and digital nomads who live on the road and go wherever the wind takes them.',
  '<circle cx="12" cy="12" r="9.5"/>' + P('M16 8l-2.5 5.5L8 16l2.5-5.5Z') + solid('M16 8l-5.5 2.5 3 3Z')),
 ('extra','furball','furball','Pet-friendly stays and trails, plus cat islands, animal cafés and anywhere with critters to meet.',
  P('M12 11.5c2.5 0 5.5 3 5.5 5.5 0 2-1.5 3-3 3-1 0-1.5-.5-2.5-.5s-1.5.5-2.5.5c-1.5 0-3-1-3-3 0-2.5 3-5.5 5.5-5.5Z')
  + dots((5, 10, 2.5), (9, 5.5, 2.5), (15, 5.5, 2.5), (19, 10, 2.5))),
]


def main():
    lines = []
    for g, i, n, d, p in A:
        lines.append(" {id:%s,name:%s,group:%s,description:%s,path:%s}" % tuple(json.dumps(x, ensure_ascii=False) for x in (i, n, g, d, p)))
    block = "export const travelerStyles=[\n" + ",\n".join(lines) + "\n];"
    assert len({a[1] for a in A}) == len(A) == 45
    f = pathlib.Path('source/site/account-state.mjs'); s = f.read_text(encoding='utf-8')
    s = re.sub(r"export const travelerStyles=\[.*?\n\];", lambda m: block, s, count=1, flags=re.S)
    f.write_text(s, encoding='utf-8')
    print(len(A), 'archetypes written')


if __name__ == '__main__':
    main()
