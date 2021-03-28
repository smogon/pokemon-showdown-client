Pokémon Showdown website APIs
=============================

Most PS APIs that you would want to access programmatically are available by adding `.json` to the URL.

They all have `Access-Control-Allow-Origin: *`, so you can access them directly using AJAX.


Replays
-------

Getting a replay:

https://replay.pokemonshowdown.com/gen8doublesubers-1097585496.json

https://replay.pokemonshowdown.com/gen8doublesubers-1097585496.log


Replay search
-------------

List recent replays:

https://replay.pokemonshowdown.com/search.json

Search by user:

https://replay.pokemonshowdown.com/search.json?user=zarel

Search by multiple users:

https://replay.pokemonshowdown.com/search.json?user=zarel&user2=yuyuko

Search by format:

https://replay.pokemonshowdown.com/search.json?format=gen8ou

Combined searching:

https://replay.pokemonshowdown.com/search.json?user=zarel&user2=yuyuko&format=gen7randombattle

Paginate searches:

https://replay.pokemonshowdown.com/search.json?user=zarel&page=2

Searches are limited to 51 results, and pages are offset by 50 each, so the existence of a 51st result means that there's at least one more page available.

Pagination is not supported for the recent replays list, but is supported for everything else.


Users (including ladder information)
------------------------------------

https://pokemonshowdown.com/users/zarel.json


Ladders
-------

https://pokemonshowdown.com/ladder/gen8ou.json


News
----

https://pokemonshowdown.com/news.json

https://pokemonshowdown.com/news/270.json


Dex resources
-------------

https://play.pokemonshowdown.com/data/pokedex.json

https://play.pokemonshowdown.com/data/moves.json
