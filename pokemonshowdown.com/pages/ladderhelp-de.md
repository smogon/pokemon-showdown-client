# Ladder-Hilfe

# Wie die Ladder funktioniert

Unsere Ladder benutzt drei Wertungssysteme: Elo, GXE und Glicko-1.

**Elo** ist das hauptsächlich Wertungssystem der Ladder. Dieses ist recht simpel aufgebaut: wenn man gewinnt, erhöht sich die Platzierung auf der Ladder, wenn man verliert, sinkt diese.

**GXE** (Glicko X-Act Estimate) gibt an, wie hoch die Wahrscheinlichkeit ist, gegen einen durchschnittlichen Spieler auf der Ladder zu gewinnen.

**Glicko-1** ist ein anderes Wertungssystem. Neben der Messung der Spielstärke beeinhaltet es die rating deviation (Abweichung).

Bitte beachte, dass die Anzahl der Siege/Niederlagen nicht als Referenz für Spielstärke genutzt werden sollte, da es viel wichtiger ist, gegen wen man spielt, als die bloße Anzahl der Siege und Niederlagen.

## PS-Elo

Dein Rating startet bei 1000.

Unser Elo-System benutzt zur Durchführung K-scaling. Der Faktor K lautet:

* K = 50 falls die Elo zwischen 1100 – 1299 liegt
* K = 40 falls die Elo 1300 oder höher beträgt

Wir haben einen so genannten rating floor von 1000 (wenn dein Rating unter 1000 fallen würde, bleibt es bei 1000). So wird verhindert, dass man neue Accounts erstellen muss, um das eigene Rating "wiederherzustellen". 

Zwischen 1000 und 1110 gibt es einige Besonderheiten:

Falls die Elo 1000 beträgt, gilt K = 80 für den Gewinner und K = 20 für den Verlierer. Zwischen 1001 und 1099 skaliert K linear: zwischen 80 bis 50 für den Gewinner und zwischen 20 und 50 für den Verlierer. So wird gewährleistet, dass sich Spieler auf der Low-Ladder zwischen 1000 und 1100 verteilen und sie durch den rating floor nicht auf 1000 festsitzen.

Ab 1400 gilt das rating decay. Jeden Tag um 11 Uhr wird dieses vollzogen:

* Falls du mehr als 5 Spiele gespielt hast, tritt das decay nicht ein.
* Falls du zwischen 1-5 Spielen gespielt hast, verlierst du 1 Punkt für jede 100 Punkte, welche du über 1500 besitzt.
* Falls du kein Spiel absolviert hast, verlierst du 1 Punkt für jede 50 Punkte, welche du über 1400 besitzt.

So wird eine Inflation von Ratings verhindert. In Formaten, welche nicht so beliebt sind (alles außer OU und Random Battle), geht das decay etwas langsamer vonstatten - du verlierst jeden Tag 2 Punkte weniger, da das rating decay dort anders aufgebaut ist.

Bitte beachte, dass es keinen "offiziellen" Elo-Standard gibt. K-scaling und rating floors kommen recht häufig vor, rating decay etwas seltener und unser K scaling scheint eine Besonderheit zu sein.

## PS Glicko-1

Dein Rating startet bei R = 1500, RD = 130.

Wir benutzen einen Wertungszeitraum von 24 Stunden und ein RD-Spektrum von 25 bis 130, mit einer Systemkonstante von 6.6775026092
