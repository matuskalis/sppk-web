SPPK — prestavba webu, kompletný výstup
=======================================

Čo je v tomto archíve
---------------------
Celá štruktúra webu, ktorú ste poslali, prevedená do HTML. V každom priečinku je
súbor index.html, teda hotová stránka. Obrázky, ktoré k stránke patria, sú v jej
podpriečinku obrazky/.

Spolu 5402 stránok.

Ako si to pozrieť
-----------------
Rozbaľte archív a otvorte index.html v hlavnom priečinku. Odtiaľ sa dá preklikať na
zvyšok. Nič sa neinštaluje, stačí prehliadač.

Jedna vec sa z disku nezobrazí správne: odkazy v menu sú písané od koreňa webu
(/uvod/index.html), lebo menu sa vkladá do stránok v rôznych hĺbkach. Fungovať budú
až keď web pobeží na serveri.

Podstránky sú čisto podstránky
------------------------------
Stránka obsahuje iba svoj obsah. Hlavička, menu, pätička a bočný stĺpec v nej nie sú,
sú to samostatné súbory:

  Header/index.html    hlavička s logom, vyhľadávaním, jazykmi a prihlásením
                       (Facebook, Instagram, LinkedIn a jazyky EN/DE/FR sú
                       prelinkované; vyhľadávanie potrebuje databázu)
  Menu/index.html      menu
  Footer/index.html    partneri a právna pätička
  tretina/index.html   bočný stĺpec

Vkladajú sa do stránok až pri nasadení. Platí to aj pre úvodnú stránku
(index.html v hlavnom priečinku): aj tá je len obsah, bez hlavičky, menu a pätičky.

Menu obsahuje celé menu sppk.sk, všetkých 144 položiek do piatich úrovní. Po nabehnutí
myšou na sekciu sa ukážu len jej hlavné podsekcie; hlbšie úrovne až po nabehnutí na
príslušnú podsekciu. 119 položiek vedie na stránky v tomto archíve, 25 zatiaľ na
sppk.sk, lebo im v štruktúre chýba priečinok (jednotlivé valné zhromaždenia Nitra
2015-2026, skupiny odborov COVP, Vzorové tlačivá, Mapa pomoci seniorom a ďalšie).
Dve z nich sú naozaj cudzie weby (Hovorme o jedle, Podpor svoj odbor).

Čo už je naplnené
-----------------
Stránky nie sú prázdne šablóny, je v nich skutočný obsah zo sppk.sk:

  5226  detailov článkov, každý vo vlastnom priečinku pomenovanom ako na webe
    65  výpisov článkov
    48  albumov fotogalérie
    41  statických stránok (vrátane anglickej, nemeckej a francúzskej verzie)
     7  kontaktných stránok

Všetky stránky v priečinku kontakt sú podľa dodaného dizajnu pre kontakty: karty
s portrétom, funkciou, telefónom, mailom a pracovnou náplňou. Úrad komory má 12 kariet,
predstavenstvo 14, dozorná rada 9, priami členovia 11, zväzy a združenia 54.
Sekcie SPPK a regionálne komory karty nemajú, ich zdroj na sppk.sk nie je v tabuľkách,
takže sú v dizajne pre príspevky.

Média / Hovorca obsahuje iba box tlačového odboru, nadpis je Hovorkyňa.

Na stránke Úrad komory je poradie zhora nadol: Vedenie, Sekretariát, jednotlivé
odbory a nakoniec Tlačový odbor, ktorý nesie kontakt na hovorkyňu.

Galéria má novú podsekciu Videoarchív SPPK s odkazom na YouTube kanál
@sppkbratislava. Je aj v menu pod Galériou.

Sekundárne nadpisy v článkoch sú zelené (#009a44). V pôvodnom CMS sú písané ako
tučný odsek, lebo starý editor nadpisy nemal; generátor ich rozpozná a spraví
z nich skutočné nadpisy. Vo výstupe ich je 13 560 na 2045 stránkach.

Jazykové verzie EN, DE a FR sú v Header/english, Header/deutsch a Header/francais
v dizajne pre príspevky; prepínač v hlavičke na ne odkazuje.

Maily boli na sppk.sk skryté pred robotmi, v texte bolo len [email protected].
Rozlúštili sme ich, v archíve sú skutočné adresy ako funkčné odkazy. Ochranu proti
robotom (mail ako obrázok) sme podľa dohody zatiaľ nerobili.

Členský obsah
-------------
888 článkov je na sppk.sk prístupných len prihláseným členom. V archíve sú aj s textom,
ale je to na nich napísané: detail má zelený rámček s upozornením, vo výpise je značka
„Len pre členov". Pri prestavbe sa teda nestratí, čo má byť neverejné.

Čo je overené
-------------
  - 0 rozbitých odkazov z 36 255 interných odkazov
  - 0 rozbitých obrázkov
  - žiadna stránka sa neposúva do strán na mobile (390 px)
  - text nikde neobteká obrázky, je zarovnaný do bloku, obrázky sú vycentrované
  - nikde nezostal skrytý mail ani smetie po kopírovaní z Wordu

Na čo dať pozor
---------------
  - Fotografie v albumoch galérie sa načítavajú zo sppk.sk, nie sú v archíve
    (je ich 1016). Portréty v kontaktoch v archíve sú.

  - Počasie v bočnom stĺpci je zatiaľ zástupné. Nadpis je premenovaný na Počasie
    a odkazuje na SHMÚ, ale živé dáta statická stránka natiahnuť nevie, treba na to
    malý serverový diel. Vec pre vášho IT-čkara, rovnako ako vyhľadávanie.

  - 5 stránok nemá obsah, lebo ho nemá ani dnešný sppk.sk: zasejme dobro,
    hovorme o jedle, SLAK, NP CEOVP, COVP. Majú viditeľný rámček, aby sa na ne
    nezabudlo.

  - Články, ktoré sa volajú rovnako, majú v názve priečinka rok, napríklad
    „Začala sa žatva (2024)". Inak by si navzájom prepísali stránku.

  - Texty sú prevzaté z dnešného sppk.sk. Kde chcete iný text, prepíšte ho priamo
    v index.html danej stránky, alebo nám ho pošlite.
