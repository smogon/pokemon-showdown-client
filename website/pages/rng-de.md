# RNG

# Warum die korrekte Anwendung eines Zufallszahlengenerators (RNG) oftmals falsch wahrgenommen wird

Wie bei jedem Spiel, welches Zufallselemente enthält, beschweren sich Leute über den Zufallszahlengenerator und behaupten, dass dieser schlecht sei, oder ihnen ungünstige Zahlen beschere. Dafür gibt es viele Gründe und wenn man dann noch Pokémon auf einem Simulator spielt, kommt es noch schlimmer:

1. Kämpfe auf dem Simulator sind viel schneller als auf der Switch oder dem 3Ds, weshalb man in der Regel öfters spielt und die Wahrscheinlichkeit für bestimmte zufällige Ereignisse somit steigt.
 
2. Mehr Leute spielen auf dem Simulator. Täglich finden mehr als 500.000 Kämpfe statt. Ein Ereignis mit eine Chance von eins zu einer Million findet jeden zweiten Tag statt! Auch wenn es unglaublich unwahrscheinlich erscheint, passiert es aufgrund der Zahlen trotzdem ständig.

3. Menschen nehmen Wahrscheinlichkeiten schlecht wahr. [Verschiedene wissenschaftliche Studien zeigen, dass Menschen das Prinzip von Zufallsverteilungen falsch verstehen, fernab davon, wie es in der Realität eigentlich funktioniert.][1]

  [1]: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5933241/


Wie der Zufallszahlengenerator auf PS funktioniert
------------------

Pokémon Showdown benutzt die gleiche Art von Zufallszahlengenerator wie in den Pokémon-Spielen auf der Switch und dem 3Ds. Hier kannst du den Quellcode sehen:

https://github.com/smogon/Pokemon-Showdown/blob/master/sim/prng.ts

Ebenso gibt es zahlreiche Seiten, welche bestätigen, dass es sich tatsächlich um den gleichen Zufallszahlengenerator wie auf der Switch und dem 3Ds handelt:

https://bulbapedia.bulbagarden.net/wiki/Pseudorandom_number_generation_in_Pokémon

Außerdem dokumentieren zahlreiche Seiten, dass dieser Gebrauch des Zufallszahlengenerators dem Standard entspricht:

https://en.wikipedia.org/wiki/Linear_congruential_generator

Falls du glaubst, dass wir einen anderen Quellcode als den obrigen benutzen, kannst du es selbst überprüfen:

Nachdem ein Kampf beenden wurde, wird mit dem Speichern des Replays auch das Input-Protokoll gespeichert, welches die Zufallszahl zur Berechnung des Zufallszahlengenerators (random seed) enthält. Für Random-Kämpfe kannst du das Protokoll direkt aus dem HTML-Quelltext der Replay-Seite entnehmen. Für Kämpfe ohne zufällige Teams sind die Zufallszahlen aus Gründen der Privatsphäre nicht sichtbar. In diesem Fall musst du dir die Erlaubnis deines Gegners einholen und anschließend den Befehl `/exportinputlog` ausführen.

Nachdem du das Protokoll erhalten hast, kannst du es nochmal abspielen, indem du den öffentlich zugänglichen Code aus Github benutzt. Dies beweist, dass es sich um den gleichen Zufallszahlengenerator wie aus dem Quellcode handelt. Diesen kannst du auslesen, um zu sehen, dass es der gleiche Zufallszahlengenerator wie auf der Switch und dem 3Ds ist.


Anmerkung
---------

Es ist möglich, Spiele mit einem Zufallselement aber ohne einen Zufallszahlengenerator zu entwickeln! Nehmen wir als Beispiel Stein-Schere-Papier: Es ist immer noch "zufällig", aber es existiert kein Zufallszahlengenerator, den du für den Ausgang eines Ereignisses verantwortlich machen kannst. Das Zufallselement wird von den Spielern selbst bestimmt!

Leider wurde Pokémon nicht auf diese Art und Weise konzipiert. Da musst du dich wohl bei Game Freak beschweren und nicht bei mir. :p
