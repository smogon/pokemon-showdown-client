# RNG

# Why correct RNGs seem "wrong"

With every game with randomness, people will complain that the Random Number Generator (RNG) is bad, or giving them bad numbers. And there's a huge list of reasons why, if you play Pokémon on a simulator, it's even worse:

1. Games go way faster on a simulator than on the Switch or 3DS, so you play more often and encounter more randomness.

2. There are more people playing. We get over 500,000 battles every day. A one-in-a-million event happens every other day! Even if it's incredibly unlikely, it'll still happen all the time, just because of the numbers.

3. Humans are bad at understanding randomness. [Numerous scientific studies show that humans think random distributions work completely differently from how they actually work.][1]

  [1]: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5933241/


How PS's RNG works
------------------

Pokémon Showdown uses the exact same type of RNG as the actual Pokémon games on the Switch and 3DS use. You can see the source code right here:

https://github.com/smogon/Pokemon-Showdown/blob/master/sim/prng.ts

And there are many pages documenting this is the same random number generator used on the Switch or 3DS:

https://bulbapedia.bulbagarden.net/wiki/Pseudorandom_number_generation_in_Pokémon

And many pages documenting that this is a completely normal RNG to use:

https://en.wikipedia.org/wiki/Linear_congruential_generator

If you think we're using different source code than the code above, you can always test it yourself:

After a battle has ended, saving its replay will also save its input log containing its random seed. For random battles, you can get the log directly from the HTML source of the replay page. For battles with non-random teams, seeds are not visible for privacy reasons – you will need to get permission from your opponent and then use the `/exportinputlog` command.

Once you have the log, you can replay it using the publicly available source code from GitHub, which proves that it's the same RNG as in the source code, which you can read to see that it's the same RNG as the Switch and 3DS.


Side note
---------

It's possible to design games with randomness without an RNG! Think about rock-paper-scissors itself: It's still "random", but there's no RNG you can blame – all the randomness comes from the players!

Unfortunately, Pokémon wasn't designed like this – you'll have to blame Game Freak, not me. :p
