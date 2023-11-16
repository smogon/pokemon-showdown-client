# Ladder help

# How the ladder works

Our ladder displays three ratings: Elo, GXE, and Glicko-1.

**Elo** is the main ladder rating. It's a pretty normal ladder rating: goes up when you win and down when you lose.

**GXE** (Glicko X-Act Estimate) is an estimate of your win chance against an average ladder player.

**Glicko-1** is a different rating system. It has rating and deviation values.

Note that win/loss should not be used to estimate skill, since who you play against is much more important than how many times you win or lose. Our other stats like Elo and GXE are much better for estimating skill.

## PS Elo

Your rating starts at 1000.

Our Elo implementation uses K-scaling. The K factor is:

* K = 50 if Elo is 1100 – 1299
* K = 40 if Elo is 1300 – 1599
* K = 32 if Elo is 1600 or higher

We have a rating floor of 1000 (If your rating would fall below 1000, it is set to 1000). This makes it unnecessary to create new accounts to "fix" your rating.

Between 1000 and 1100, we have some special behavior:

If Elo is 1000, K = 80 for the winner and K = 20 for the loser. Between 1001 to 1099, K scales linearly from 80 to 50 for the winner and from 20 to 50 for the loser. This helps spread out low ladder people between 1000 and 1100 instead of causing the rating floor to cluster them all at 1000.

Above 1400, we have rating decay. Every day at 9 AM GMT+0:

* If you played over 5 games, there is no decay
* If you played 1-5 games, you lose 1 point for every 100 points above 1500 you are
* If you played 0 games, you lose 1 point for every 50 points above 1400 you are

This helps combat rating inflation. Ratings of less popular formats (ie. not current gen OU or random battles) decay slightly slower - you lose 2 points less per day due to rating decay in these formats.

Note that there's no "official" Elo standard. K-scaling and rating floors are common, rating decay somewhat common, and our dynamic K scaling seems to be unique.

## PS Glicko-1

Your rating starts at R = 1500, RD = 130.

We use a rating period of 24 hours and an RD range of 25 to 130, with a system constant of 6.6775026092.
