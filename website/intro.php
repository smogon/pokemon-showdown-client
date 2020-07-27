<?php

include 'style/wrapper.inc.php';

$page = 'intro';
$pageTitle = "Intro";

includeHeader();

?>
		<div class="main">
			<h1>Introduction to Competitive Pok&eacute;mon</h1>

			<p>
				<img src="/images/icame.png" alt="OAK: I came when I heard you'd beaten the ELITE FOUR." />
			</p>
			<p>
				So maybe you've beaten the Elite Four more times than you can count. Maybe you've caught them all. Maybe you consider "Nuzlocke challenge" an oxymoron. And maybe, just maybe, you're ready to take the next step.
			</p>
			<p>
				Welcome to Smogon University. Here, you'll learn the techniques the best of the best use to win in competitive Pok&eacute;mon. And maybe one day, you'll be one of them.
			</p>

			<h2>What to expect</h2>

			<p>
				When you're used to playing against trainers and wild Pokémon in the games, playing against other humans can be a bit of a shock. Unlike the AI in the games, your opponents will also have max-level fully-trained teams, and more importantly, they will figure out your strategy, and they'll do their best to deal with it.
			</p>
			<p>
				The biggest difference from the games is that competitively, switching happens all the time. If you have a Fire-type against their Grass-type, don't expect your opponents to leave it in to die. They'll be switching out into a Water-type. And if you switch out your Fire-type into a Grass-type to handle that Water-type, they might predict that and use Ice Beam. Much strategy revolves around predicting what your opponent will do and acting accordingly.
			</p>
			<p>
				The role of luck can be an unpleasant surprise. In the games, your advantages balance out a lot of the bad luck you could get. But on an even playing field, critical hits and 10% secondary effects on moves become a lot more frustrating. Just remember, no one wins 100% of the time, and the important part is to win more often than you lose in the long run.
			</p>

			<h2>Game mechanics</h2>

			<p>
				Let's start with the basics. "Mechanics" are what we call the way the game works. You probably already know that Water is super-effective against Fire and not very effective against Grass, but it's easy to beat the game without learning anything deeper.
			</p>
			<p>
				In nearly every game type in Pok&eacute;mon, the goal is to make all six of your opponent's Pok&eacute;mon faint, and this is generally done by using moves to deal damage.
			</p>
			<h3>Physical and Special moves</h3>
			<p>
				All attacking moves are either Physical or Special moves. Physical moves use your attacker's Attack stat against your target's Defense stat, while Special moves use your attacker's Special Attack stat against the target's Special Defense stat.
			</p>
			<blockquote><p>
				<img src="//play.pokemonshowdown.com/sprites/categories/Physical.png" alt="[Physical]" /> Physical<br />
				<img src="//play.pokemonshowdown.com/sprites/categories/Special.png" alt="[Special]" /> Special<br />
			</p></blockquote>
			<p>
				In game and online, these icons will remind you of whether a move is Physical or Special. Remember that a Pokémon with high Attack and low Special Attack should usually be using only Physical moves, and vice versa.
			</p>
			<h3>EVs, IVs, and Natures</h3>
			<p>
				Even at the exact same level, two Alakazams usually won't have exactly the same stats. That's because each has different Effort Values (EVs), Individual Values (IVs), and Natures.
			</p>
			<p>
				There are 25 Natures a Pokémon can have. 20 of them raise one stat by 10% and lower another by 10%, and the other 5 do nothing. In addition, your Pokémon has one IV number for each stat, ranging from 0 to 31. The higher your IV, the higher that stat is, so you usually want every IV to be 31.
			</p>
			<p>
				Your Pokémon also has one EV number for each stat, ranging from 0 to 252. Like IVs, the higher it is, the higher your stat. But you can only have a maximum of 508 EVs, so you have to be careful where you put them.
			</p>
			<p>
				<img src="/images/statspread.png" alt="Example stat spread" />
			</p>
			<p>
				As an example, here's one common spread for a Volcarona.
			</p>
			<p>
				On a simulator, you can just select what Nature, IVs, and EVs you want. In-game, it's more complicated; <a href="http://www.smogon.com/forums/threads/breeding-perfect-pokemon-in-pokemon-x-y.3491104/" target="_blank">TheMantyke has written a pretty good guide to breeding for the IVs and Nature you want</a>, and <a href="http://www.smogon.com/forums/threads/a-guide-to-ev-training-with-hordes.3490052/" target="_blank">Stellar has written a guide to EV training</a>.
			</p>
			<h3>STAB</h3>
			<p>
				Same-Type Attack Bonus (STAB) means that if a Pokémon uses an attacking move of the same type as the Pokémon using it, that move gets 1.5&times; its usual base power. This is a huge bonus, so most Pokémon carry at least one STAB move.
			</p>
			<h3>Turn order</h3>
			<p>
				Pokémon will switch first, then mega-evolve, and after that the remaining Pokémon will use moves in order of Speed, fastest to slowest. In the case of a Speed tie, it's random who moves first. Certain moves are exceptions; moves that have positive priority like Protect and ExtremeSpeed will always move before others, and moves that have negative priority like Whirlwind and Trick Room will always move last.
			</p>

			<h2>Formats</h2>

			<p>
				Competitive Pokémon can be split into three kinds of ways to play, which are called formats. These formats have a lot of rules in common, which we call clauses:
			</p>
			<ul>
				<li><p>Species Clause: Two of the same Pokémon may not be used on the same team (most formats have this rule)</p></li>
				<li><p>Sleep Clause: You can't put two opposing Pokémon to sleep at the same time (Nintendo formats don't have this rule).</p></li>
				<li><p>Evasion Clause: You can't use Double Team or Minimize. (Nintendo formats don't have this rule)</p></li>
				<li><p>OHKO Clause: You can't use One-Hit KO moves like Fissure. (Nintendo formats don't have this rule)</p></li>
				<li><p>Item Clause: You can't use two of the same item on the same team (Smogon formats don't have this rule).</p></li>
			</ul>
			<h3>Official Nintendo formats</h3>
			<p>
				There are three main Nintendo formats, Battle Spot Singles, Battle Spot Doubles, and VGC. They share mostly the same rules. In addition to the Species and Item Clauses mentioned above, they ban event legendaries and cover legendaries.
			</p>
			<p>
				Battle Spot Singles is a bring-6-choose-3 singles format, and Battle Spot Doubles is a bring-6-choose-4 doubles format.
			</p>
			<p>
				VGC is Nintendo's official tournament. VGC rules change every year; in 2014, its rules are the same as Battle Spot Doubles, except only Pokémon that are Kalos-native and appear in the Kalos Pokédex are allowed.
			</p>
			<h3>Official Smogon formats</h3>
			<p>
				The Smogon singles formats are Ubers, OU (Overused), UU (Underused), RU (Rarely-used), NU (Neverused), LC (Little Cup). These formats are all singles bring-6-choose-6. They're named after their corresponding Smogon tier (except LC).
			</p>
			<p>
				Smogon also has a bring-6-choose-6 doubles format, named Smogon Doubles. Its rules are fairly similar to OU.
			</p>
			<h3>The Smogon tier system</h3>
			<p>
				Smogon has a usage-based tier system. Basically, a few Pokémon are considered too strong and considered Uber. After that, all other Pokémon are allowed to be used in OU (Overused). Any Pokémon used on average more than once every 20 battles in OU is considered in the OU tier, and the rest are allowed in UU. Any Pokémon used on average more than once every 20 battles is considered UU, and the rest are allowed in RU.
			</p>
			<p>
				This tiering system orders Pokémon roughly from best to worst, and makes it so that even if you want to use an underpowered Pokémon, there's a Smogon tier that allows it to go up against Pokémon that are approximately as strong as it.
			</p>
			<p>
				Little Cup is separate from the Smogon tier system, and is a format where only the lowest evolution stage of Pokémon that can evolve are allowed.
			</p>
			<p>
				<a href="http://www.smogon.com/xyhub/tiers" target="_blank">Smogon's XY Tiers page</a> contains additional information about Smogon formats.
			</p>
			<h3>Other metagames</h3>
			<p>
				In addition to the official Nintendo and Smogon formats, fans commonly try to invent their own rules for playing. The most popular is Balanced Hackmons, which is a format where hacked Pokémon are allowed. It feels very different from regular Pokémon!
			</p>

			<h2>Basic strategy</h2>

			<p>
				Now that we have a general idea of what the rules are like, let's discuss some things you'll probably see a lot.
			</p>
			<h3>Entry hazards</h3>
			<p>
				<img src="/images/stealthrocks.jpg" alt="" />
			</p>
			<p>
				Entry hazards are moves like Stealth Rock and Spikes. These moves stay on your opponent's side of the field and do damage to each Pokémon your opponent switches in. In addition to making your opponent's Pokémon easier to handle, they also provide a deterrent to switching, which, if you recall, is one of the most important parts of the game.
			</p>
			<p>
				Because entry hazards are so powerful, over half of teams in singles use them. Because of this, it's also common to use Rapid Spin (which removes hazards affecting you) or Defog (which removes all hazards) to remove them.
			</p>
			<h3>Set-up and phazing</h3>
			<p>
				Because you're giving up an entire turn that could have been used attacking, most moves that do nothing but raise or lower stats are useless. The exception is boosting moves that can help set up a Pokémon to sweep. 
			</p>
			<p>
				A sweep is the act of a Pokémon knocking out multiple opposing Pokémon in a row. Certain moves, such as Swords Dance, Dragon Dance, Shell Smash, and Calm Mind raise your Pokémon's attacking stats and Speed to the point where it could defeat all your opponent's remaining Pokémon that threaten it in one hit.
			</p>
			<p>
				Stat boosts reset when a Pokémon switches out, so one way to deal with a set-up sweeper Pokémon is to force it to switch out, using a move like Roar, Whirlwind, or Dragon Tail. This is called pseudo-Hazing (phazing), because, like Haze, it resets the opposing Pokémon's stat boosts.
			</p>
			<h3>Checks and counters</h3>
			<p>
				A counter to, say, Scizor, is a Pokémon that can switch into any of Scizor's attacks, and nearly always win against it. For instance, Zapdos counters Scizor. Even if Scizor sees the Zapdos switch-in coming, there's nothing it can do to Zapdos. Its only options are to switch out or faint.
			</p>
			<p>
				A check to Scizor, on the other hand, is a Pokémon that can win against Scizor if both are in play, but can't safely switch in to of Scizor's moves. For instance, Heatran checks Scizor. Normally, Heatran can destroy Scizor, but if Scizor predicts Heatran to switch in and uses Superpower, Heatran will be KOed.
			</p>
			<p>
				In general, if a Pokémon takes less than 50% damage from any of a Pokémon's moves, it can counter.
			</p>
			<p>
				When building a team, it's important to look at what Pokémon check and counter the Pokémon in your team. Once you've around halfway through building a team, you should start asking yourself, "What popular Pokémon in the format is my team completely unable to handle?" and then start adding Pokémon that counter (or at least check) those Pokémon.
			</p>

			<h2>What now?</h2>

			<p>
				Well, now you have a basic idea of how competitive battling works. If you'd like to dive straight in, play Pokémon Showdown! Our Random Battle format is great for learning the basics of competitive play.
			</p>
			<p class="mainbutton">
				<a class="button greenbutton" href="//play.pokemonshowdown.com/">Play online</a>
			</p>
			<p>
				If you'd like more help, Smogon University offers a <a href="http://www.smogon.com/forums/forumdisplay.php?f=42" target="_blank">Battling 101 program</a>, where you will be paired with a tutor.
			</p>
			<p>
				If you're not looking for anything that specific, the <a href="http://www.smogon.com/forums/" target="_blank">Smogon forums</a> offer a number of other places to talk about whatever you want. Want people to <a href="http://www.smogon.com/forums/forumdisplay.php?f=52" target="_blank">rate the team you made</a>? Want to <a href="http://www.smogon.com/forums/forums/xy-discussion.249/" target="_blank">talk about strategy</a>? Or just want to hang out? Smogon is the right place for you!
			</p>
		</div>
<?php

includeFooter();

?>
