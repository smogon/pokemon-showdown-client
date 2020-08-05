# What is COIL?
<sup>(Written by [Antar](https://www.smogon.com/forums/members/antar.45129/); converted to Markdown for the PS! website by [Annika](https://www.smogon.com/forums/members/annika.434112/))</sup>

Adapted from [this thread](http://www.smogon.com/forums/threads/mystery-ratings-demystified.3498232/).

### TL;DR
---
COIL is a system that was developed for suspect requirement purposes. Your COIL score is a function of your GXE and the number of battles you have had on the ladder. The higher your GXE, the fewer number of battles you'll need to achieve reqs.

---
If you're participating in a suspect test, you may have noticed that you achieve requirementss based not on your usual ladder rating, but on a mysterious score called COIL. This "mystery rating" is a system Antrr designed for determining requirements for suspect tests.

In the past, determining requirements has been a thorny issue, due to the fact that conventional rating systems (like ELO and Glicko) are designed to measure skill, not achievement. So oftentimes, the top-rated player has been someone who's, say, gone 20-0, vs. a player with a few losses but with many more games. Does that player deserve requirementss? The consensus has been an emphatic "no" (whether that person deserves to top the ladder is a separate question). But so if estimated skill alone shouldn't determine player rating, what should?

The simplest thing would be to determine reqs based on W/L ratio and number of battles, but there's a problem with W/L ratio: Pokémon Showdown does matchmaking that attempts to pair players with players of the same skill level as often as possible, so in a perfect world, everyone would have the same win rate of 50%.

But while we can't use literal win rates, we can use another measure that we already compute to get at the same idea. GXE is a measure that was developed by Smogon legend X-Act as an alternative ranking system to conservative rating estimates such as ACRE. It represents the percentage odds of you winning a battle against a randomly selected person on the ladder. In other words, GXE corresponds to what we would expect your win rate to be if we weren't doing any matchmaking. Thus, we can use it as a substitute for W/L ratio.

And that leads me directly to the Converging Order-Invariant Ladder (COIL) score. It's calculated entirely based on GXE and number of battles, and it's set up so that the higher your skill level (your GXE), the fewer number of battles you'll need to achieve reqs. Note that with COIL, your rating eventually converges to a fixed value (40x your GXE). That means that if your GXE is under a certain value, you'll be unable to achieve reqs no matter how many battles you have. This is by design, and the COIL cutoff is chosen for each suspect test such that only players of "sufficient skill" can achieve reqs.

The formula for COIL is the following:

**C = 40 &sdot; GXE &sdot; 2<sup>(<sup>-B</sup>&frasl;<sub>N</sub>)</sup>**

where `B` is a parameter unique to a given tier and suspect test, `N` the number of battles you've had, and `C` your COIL score. In the long term, a player's rating will converge over time to 40 times their GXE. So the very top players may end up with a COIL of around 4000, while good players will end up with GXEs around 3000.

That's nice and all, but what most players want to know is, "how many battles will I need in order to get reqs?" To find that out, we solve the above equation for N:

**N = B &divide; log<sub>2</sub>(40 &sdot; GXE &divide; C)**

where `C` in this context is the reqs cutoff. (This formula is ready for you to plug in your specific values. If you're going to do so, I recommend using Google Calculator.)

Let's try an example. Let's say the reqs cutoff for a test is 2000, and it's using a `B` of 40. For that test, a player with a GXE of 90 will require 48 battles to meet reqs, and a player with a GXE of 75 will require 69. A player with GXE of 60 will need 152 battles to reach reqs, and a player with GXE of 50 never will.

As we move forward, when a suspect test starts, the tier leaders should be announcing not just the cutoff value but their choice of B as well (though note that these could change midway through a test, if necessary), meaning you'll be able to use that last formula to figure out how quickly you'll be able to get reqs. If B is not explicitly published, you can look it up for yourself by checking out the [Pokémon Showdown source code](https://github.com/smogon/pokemon-showdown-client).