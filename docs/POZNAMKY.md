# sppk-web

Prestavba sppk.sk podľa dizajnov, ktoré chodia po častiach ako Figma Make exporty.
Výstup sú **samostatné HTML súbory**, nie React komponenty.

```
design/    dizajn a zadania tak, ako prišli od klienta (needitovať)
design/komponenty/  hlavička, menu, pätička, tretina a úvodná ako samostatné súbory
struktura/ priečinková štruktúra webu od klienta (197 priečinkov, 47 obrázkov)
templates/ šablóny + spoločné časti webu
web/       ← VÝSTUP: celý web, index.html v každom priečinku štruktúry
stranky/   starý prototyp (fill.mjs, 10 ukážok), nahradený priečinkom web/
scripts/   generovanie
```

## Celý web

```bash
npm run build   # prejde struktura/, vygeneruje web/ aj komponenty
npm test        # kontrola výstupu, musí skončiť „BEZ CHÝB"
```

Text, ktorý ide s archívom klientovi, je `templates/README-vystup.txt`; build ho
kopíruje do `web/README.txt`, takže prežije prestavbu.

`scripts/kontrola.mjs` overuje na hotovom výstupe: či sa každý odkaz a obrázok dá
nájsť na disku, či sa inline skripty komponentov dajú rozparsovať, či nikde nezostal
skrytý mail, wordovský `file:///` alebo trieda `Mso*`, či si dva články nesadli na tú
istú cestu a či niektorá stránka nezostala bez jediného odkazu.

### Stránky sú čisto podstránky

Podstránka nesie **iba svoj obsah**. Hlavička, menu a pätička v nej nie sú, sú to
samostatné súbory vo `web/Header/`, `web/Menu/`, `web/Footer/` a `web/tretina/` a
pridajú sa do stránok neskôr. **Platí to aj pre úvodnú stránku** — `web/index.html`
je od 9. 9. tiež len obsah, bez hlavičky, menu a oboch pätičiek.

Menu obsahuje **celé menu sppk.sk, všetkých 144 položiek** do piatich úrovní
(napr. Vzdelávanie → Stredoškolské odborné vzdelávanie → COVP → Zriadené COVP →
Poľnohospodárstvo). Overené proti živému webu: rovnaký počet odkazov.

Dodaný komponent mal 6 zástupných položiek a jednu úroveň. Rozbaľovanie som doplnil
v jeho štýle a **po sekcii sa otvoria len jej hlavné podsekcie**; hlbšie úrovne až po
nabehnutí myšou na príslušnú podsekciu, ktorá to hlási šípkou `›`. Panel preto nesmie
mať `overflow`, inak by odrezal bočné podmenu.

Odkazy sú **od koreňa webu** (`/uvod/index.html`), lebo menu sa vkladá do stránok
v rôznych hĺbkach a jedna relatívna predpona by pre všetky nesedela. Pri prezeraní
zo servera fungujú, pri otvorení cez `file://` nie.

118 položiek vedie na naše stránky. **25 položiek nemá v štruktúre priečinok**
a vedie zatiaľ na sppk.sk: Nitra 2015-2026 (jednotlivé valné zhromaždenia),
skupiny odborov COVP, Vzorové tlačivá, Mapa pomoci seniorom a ďalšie. Dve z nich
sú naozaj cudzie weby (Hovorme o jedle, Podpor svoj odbor).

### Kontakty

Všetko v `kontakt/` a `media/hovorca` ide podľa
`design/html-kody/html-kontakt/kontakt-novy.html`: karty, zelené role, portréty,
zoznam pracovnej náplne. Mapovanie priečinok → článok je v `CONTACT_PAGES`
v `scripts/build-web.mjs`.

| stránka | článok | kariet |
|---|---|---|
| úrad komory | 723 | 12 |
| predstavenstvo SPPK | 724 | 14 |
| dozorná rada SPPK | 725 | 9 |
| priami členovia | 726 | 11 |
| zväzy, združenia, únie | 728 | 54 |
| Sekcie SPPK | 865 | zdroj nie je v tabuľkách → šablóna pre príspevky |
| regionálne komory | 27 | to isté |

Parser číta `<table>` z pôvodného článku: zelený riadok hlavičky je názov odboru,
každá bunka je jeden človek (foto, tučné meno, funkcia, telefón, mail, pracovná náplň).
Keď v článku tabuľky nie sú, stránka spadne na **ten istý** článok v šablóne pre
príspevky, nie na fuzzy zhodu, ktorá predtým podstrčila cudzí text.

`media/hovorca` je ten istý článok 723 orezaný na jediný box (`CONTACT_ONLY`)
a s nadpisom `Hovorkyňa` (`CONTACT_TITLE`).

Portréty sa sťahujú lokálne do `obrazky/` danej stránky, takže sa zobrazia aj bez
internetu.

### Maily

sppk.sk maily skrýva cez Cloudflare, v texte je len `[email protected]`, skutočná
adresa v atribúte `data-cfemail`. Generátor ich dekóduje a vkladá ako `mailto:`.
Vo výstupe je **250 rôznych adries** a nikde nezostal zástupný text.

Ochrana proti robotom (mail ako obrázok) sa **zatiaľ nerobí**, je odložená.

### Komponenty

`scripts/build-komponenty.mjs` berie dodané súbory z `design/komponenty/` a dopĺňa im,
čo v nich chýbalo:

- **Header** — Facebook, Instagram a LinkedIn na skutočné profily, EN/DE/FR na
  lokálne stránky `Header/english|deutsch|francais` v šablóne pre príspevky. Vyhľadávanie je zatiaľ mŕtve, potrebuje databázu.
- **Footer** — „Prevádzka: IZPI Nitra" na `izpi.sk`, Copyright zámerne nie je odkaz.
- **tretina** — „Rozhodcovský súd SPPK" premenovaný na **Arbitrážny súd** s odkazom na
  `arbitraznysud.sk`, „Staň sa členom" mieri na stránku v archíve, box „Agrometeo /
  Počasie" premenovaný na **Počasie** (22 px) s odkazom na SHMÚ. **Živé dáta počasia
  statická stránka natiahnuť nevie**, treba na to serverovú časť.

### Farba nadpisov

Sekundárne nadpisy (`h2`) na stránkach so šablónou pre príspevky sú `#009a44` / 22 px.
Týka sa to `.doc-subheading`, `.doc-body h2` až `h6` aj `.section-heading-plain`
(nadpis „Podstránky"). Nadpisy odborov na kontaktných stránkach ostávajú čierne,
tak ich má dodaný dizajn.

### Členský obsah

900 článkov je na sppk.sk len pre prihlásených členov. Vo výstupe je to vidno:
detail má zelený rámček s vetou o členskom prístupe, výpis má značku
„Len pre členov". Označených je **888 stránok**.

### Detaily článkov

Každý článok za výpismi má vlastný priečinok pomenovaný ako na sppk.sk, s
`index.html` vnútri. Je ich **5226**. Umiestňujú sa podľa drobečkovej navigácie;
čo sa nedá zaradiť, ide do `ostatne/`.

Prejde priečinkovú štruktúru od klienta a do každého priečinka napíše `index.html`
naplnený reálnym obsahom zo sppk.sk. Obrázky, ktoré v priečinku sú, idú so stránkou
do jej `obrazky/`.

Ako sa priečinok páruje s obsahom: najprv podľa URL alebo názvu stránky, potom
podľa názvu článku, pri galérii podľa názvu albumu. Názvy priečinkov majú preklepy
oproti reálnym adresám (`spravy zo zasadnutiC-C`, `Spolupraca  Vysehradshej stvorky`),
takže po presnej zhode nasleduje porovnanie cez trojznakové úseky.

Posledný beh, 5402 stránok:

| typ | počet |
|---|---|
| detaily článkov | 5226 (161 s rokom v názve, lebo názov sa opakuje) |
| výpisy článkov | 65 |
| albumy galérie | 48 |
| statické stránky | 41 (vrátane EN/DE/FR pod Header/) |
| stránky článkov v štruktúre | 14 |
| rozcestníky sekcií | 7 |
| kontaktné stránky | 7 |
| komponenty (hlavička, menu, pätička, tretina) | 4 |

Tých 5 bez obsahu (`zasejme dobro`, `hovorme o jedle`, `SLAK`, `NP CEOVP`, `COVP`)
nemá obsah ani na živom webe; vykreslia sa s viditeľným rámčekom, nie ticho prázdne.

Skontrolované: **0 rozbitých odkazov** z 36 255 interných odkazov, žiadne vodorovné pretečenie na 390 px.

Z obsahu sa cestou vyhadzuje smetie, ktoré je rozbité aj na živom sppk.sk: obrázky
z Wordu (`file:///C:/Users/...`), `blob:` a `about:` adresy, Facebook `attributionsrc`
a triedy `Mso*`.



Všetko je písané **inline CSS**, žiadny Tailwind CDN. Dodané `galeria.html`,
`odkazy.html` a `prispevky.html` používali Tailwind cez CDN, čo je vývojársky nástroj,
ktorý na ostrom webe zdržuje vykreslenie a ťahá skript z cudzieho servera.

## Šablóny

| súbor | čo to je |
|---|---|
| `templates/hlavicka.html` | hlavička, menu, vyhľadávanie, jazyky, prihlasovací modal, mobilné menu |
| `templates/paticka.html` | partneri a právna pätička |
| `templates/uvod-navrh.html` | úvodná podľa dodaného návrhu |
| `templates/uvod-volna-tretina.html` | úvodná, pravá tretina prázdna a vyhradená |
| `templates/uvod-dnesne-widgety.html` | úvodná, pravá tretina ako dnes na sppk.sk |
| `templates/uvod-cela-sirka.html` | úvodná bez bočného stĺpca |
| `templates/galeria.html` | galéria, 48 skutočných albumov |
| `templates/vypis-clankov.html` | výpis článkov s filtrom kategórií a stránkovaním |
| `templates/prispevok.html` | detail príspevku (placeholdery, plní ho `fill.mjs`) |

Generujú sa z jedného zdroja, aby sa neroz išli:

```bash
node scripts/build-homepage.mjs   # štyri verzie úvodnej
node scripts/build-galeria.mjs    # galéria + stiahnutie obálok albumov
node scripts/build-vypis.mjs      # výpis článkov + stiahnutie náhľadov
```

Do pätičky aj do partnerov na úvodnej idú **skutočné logá** zo `struktura/`, nie
vymyslené názvy typu „Agropodnik Nitra a.s." z návrhu.

## Šablóna príspevku

`templates/prispevok.html` — detail článku / podstránka. Placeholdery:
`{{TITLE}}`, `{{META}}`, `{{INTRO}}`, `{{BODY}}`.

Poradie na stránke: nadpis, meta riadok, perex, telo.

**Meta riadok** je jeden riadok s odrážkami:
`Autor • Dátum • Zdroj: X`. Segment, ktorý článok nemá, sa aj s odrážkou vypustí —
väčšina článkov nemá zdroj, takže bežný výsledok je `Autor • Dátum`.

**Text neobteká obrázky.** Podľa `design/manual-k-prispevkom.pdf`: obrázok je vždy
samostatný blok `figure.doc-figure`, **vycentrovaný**, či už je nad textom, v texte
alebo pod ním. Text je **zarovnaný do bloku (justify)**, teda aj sprava aj zľava.
`float` je v CSS explicitne `none`.

Ďalej podľa `design/poznamky-gemini.pdf`:

- externé odkazy dostanú triedu `external`, zelenú farbu, šípku `↗`,
  `target="_blank"` a `rel="noopener noreferrer"`; odkazy na sppk.sk nie
- odrážky zoznamov sú zelené `#009a44` krúžky, nie čierne bodky
- tabuľky sa posúvajú vo vlastnom `div.doc-table`
- triedy `Mso*` z Wordu sa vyhadzujú

Typografia je prevzatá 1:1 z `design/charakteristika-sppk.html`: Inter + DM Serif
Display, zelená `#009a44`, `padding: 60px 24px 80px`.

Šírka stĺpca je 1200 px podľa dodaného `html-kody/html-prispevky/prispevky.html`.
Obrázky majú zaoblenie 12 px z toho istého súboru; jediná odchýlka je, že sa
nezväčšujú nad svoju veľkosť, inak by sa 75 px logo roztiahlo na 1152 px.

## Naplnenie šablóny

```bash
npm install
node scripts/fill.mjs 5904 20 5905 2833     # ID článkov zo sppk.sk
```

Výstup kopíruje priečinkovú štruktúru z `struktura/`: cesta sa skladá z drobečkovej
navigácie článku, každá stránka má vlastný priečinok s `index.html` a `obrazky/`.
Obrázky sa sťahujú lokálne a odkazujú sa relatívne, takže stránka sa dá otvoriť
priamo z disku bez servera.

```
web/zaujimave-informacie/Žatva ide do finále/
  index.html
  obrazky/01.jpg
```

`OUT_DIR=/cesta` presmeruje výstup inam, `SKIP_IMAGES=1` vypne sťahovanie obrázkov
(rýchle dávkové behy, obrázky ostanú na pôvodných adresách).

Dáta berie zo scrapera v `~/projects/sppk-redesign/scraper/data-full/`
(`articles/<id>.json`, `articles.json` a výpisy v `pages.json` ako záloha hlavičky).

Čo skript robí s obsahom, ktorý prišiel z pôvodného CMS:

- `<div>` používané ako odseky prepíše na `<p>`, obaľovacie `<div>` rozbalí
- vyhodí inline `style`/`align` a značky `big`/`font`/`center`
- vyhodí prázdne `&nbsp;` odseky, ktoré v starom layoute robili medzery
- vyberie obrázky **a videá** (`iframe`/`embed`/`video`) z odsekov do
  `figure.doc-figure` a zmaže im pevné pixelové rozmery; ak bol obrázok odkazom,
  odkaz zostáva
- perex rozpozná podľa oboch značiek, ktoré redaktori používajú: tučné písmo alebo
  zelený `<span style="color:#006400">` (často v `<big>`)
- krátky celotučný odsek povýši na `h2.doc-subheading` (starý editor nemá nadpisy);
  vety, odkazy a e-maily nechá tak
- dátum vytiahne aj z rozbitého poľa — 830 z 5323 článkov má namiesto dátumu
  viacriadkový blok s dátumom vnútri
- tabuľkám zoberie pevné šírky a zabalí ich do `div.doc-table`, ktorý sa posúva
  vodorovne sám, nie celá stránka
- riadok `Zdroj: X` na konci textu presunie do meta riadku
- ak článok nemá telo, vypíše `POZOR`; po doplnení členského obsahu ostáva takých
  už len 11 z 5323

Overené na celom korpuse 5323 článkov: žiadny spadnutý beh, na 80 náhodne vybraných
článkoch nulová strata odkazov, obrázkov, videí, tabuliek, položiek zoznamov ani textu.

## Členský obsah

900 článkov sa neprihlásenému návštevníkovi zobrazuje s prázdnym telom — nie sú
pokazené, sú **len pre členov**. Po prihlásení majú plný text, niektoré aj 54 000
znakov. Verejné články sú po prihlásení znak po znaku rovnaké, členská verzia teda
pridáva len tieto texty.

Dopĺňa ich `scraper/member-scrape.mjs`. Prihlasovacie údaje berie z prostredia a
nikdy ich nezapisuje na disk:

```bash
SPPK_COOKIE='PHPSESSID=...' node member-scrape.mjs   # session z prihláseného prehliadača
SPPK_USER='...' SPPK_PASS='...' node member-scrape.mjs
```

## Ukážky

Namiesto zoznamu ukážok je teraz celý web vo `web/`. Na rýchlu kontrolu:

| stránka | čo ukazuje |
|---|---|
| `web/index.html` | úvodná, jediná stránka s hlavičkou a pätičkou v sebe |
| `web/Menu/index.html` | menu, rozbaľovanie po sekcii a po podsekcii |
| `web/kontakt/urad komory/` | kontaktný dizajn, karty s portrétmi a mailmi |
| `web/media/hovorca/` | ten istý článok orezaný na tlačový odbor |
| `web/media/tlacove spravy/` | výpis, 408 článkov, každý s vlastnou stránkou |
| `web/legislativa/dokumenty SPPK/` | výpis dokumentov (Rokovací poriadok a spol.) |
| `web/galeria/` | 48 albumov |

Menu treba pozerať zo servera (`python3 -m http.server` vo `web/`), jeho odkazy sú
od koreňa webu.

## Ďalšie šablóny

Nová časť webu = nový súbor v `templates/`. Typografiu neopisovať odznova, kopírovať
blok `<style>` z `prispevok.html`, aby sa verzie nerozišli.
