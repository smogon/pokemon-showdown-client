Skip to content
Search or jump to…

Pull requests
Issues
Marketplace
Explore
 
@Timbuktu22 
smogon
/
pokemon-showdown-client
44
331456
Code
Issues
35
Pull requests
37
Actions
Projects
Security
Insights
You’re making changes in a project you don’t have write access to. Submitting a change will write it to a new branch in your fork Timbuktu22/pokemon-showdown-client, so you can send a pull request.
pokemon-showdown-client
/
src
/
battle.ts
in
smogon:master
 

Tabs

3

No wrap
1
/**
2
 * Pokemon Showdown Battle
3
 *
4
 * This is the main file for handling battle animations
5
 *
6
 * Licensing note: PS's client has complicated licensing:
7
 * - The client as a whole is AGPLv3
8
 * - The battle replay/animation engine (battle-*.ts) by itself is MIT
9
 *
10
 * Layout:
11
 *
12
 * - Battle
13
 *   - Side
14
 *     - Pokemon
15
 *   - BattleScene
16
 *     - BattleLog
17
 *       - BattleTextParser
18
 *
19
 * When a Battle receives a message, it splits the message into tokens
20
 * and parses what happens, updating its own state, and then telling
21
 * BattleScene to do any relevant animations. The tokens then get
22
 * passed directly into BattleLog. If the message is an in-battle
23
 * message, it'll be extracted by BattleTextParser, which adds it to
24
 * both the battle log itself, as well as the messagebar.
25
 *
26
 * @author Guangcong Luo <guangcongluo@gmail.com>
27
 * @license MIT
28
 */
29
​
30
/** [id, element?, ...misc] */
31
type EffectState = any[] & {0: ID};
32
/** [name, minTimeLeft, maxTimeLeft] */
33
type WeatherState = [string, number, number];
34
type EffectTable = {[effectid: string]: EffectState};
35
type HPColor = 'r' | 'y' | 'g';
36
​
37
class Pokemon implements PokemonDetails, PokemonHealth {
38
   name = '';
39
   speciesForme = '';
40
​
41
   /**
42
    * A string representing information extractable from textual
43
    * messages: side, nickname.
44
    *
45
    * Will be the empty string between Team Preview and the first
@Timbuktu22
Propose changes
Commit summary
Create battle.ts
Optional extended description
Add an optional extended description…
 
© 2021 GitHub, Inc.
Terms
Privacy
Security
Status
Docs
Contact GitHub
Pricing
API
Training
Blog
About
