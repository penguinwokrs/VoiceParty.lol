# Riot API Endpoints

> Generated from mingweisamuel/riotapi-schema (OpenAPI 3.0.0)

## account-v1

| Method | Path | Summary |
| --- | --- | --- |
| GET | /riot/account/v1/accounts/by-puuid/{puuid} | Get account by puuid |
| GET | /riot/account/v1/accounts/by-riot-id/{gameName}/{tagLine} | Get account by riot id |
| GET | /riot/account/v1/accounts/me | Get account by access token |
| GET | /riot/account/v1/active-shards/by-game/{game}/by-puuid/{puuid} | Get active shard for a player |
| GET | /riot/account/v1/region/by-game/{game}/by-puuid/{puuid} | Get active region (lol and tft) |

## champion-mastery-v4

| Method | Path | Summary |
| --- | --- | --- |
| GET | /lol/champion-mastery/v4/champion-masteries/by-puuid/{encryptedPUUID} | Get all champion mastery entries sorted by number of champion points descending. |
| GET | /lol/champion-mastery/v4/champion-masteries/by-puuid/{encryptedPUUID}/by-champion/{championId} | Get a champion mastery by puuid and champion ID. |
| GET | /lol/champion-mastery/v4/champion-masteries/by-puuid/{encryptedPUUID}/top | Get specified number of top champion mastery entries sorted by number of champion points descending. |
| GET | /lol/champion-mastery/v4/scores/by-puuid/{encryptedPUUID} | Get a player's total champion mastery score, which is the sum of individual champion mastery levels. |

## champion-v3

| Method | Path | Summary |
| --- | --- | --- |
| GET | /lol/platform/v3/champion-rotations | Returns champion rotations, including free-to-play and low-level free-to-play rotations (REST) |

## clash-v1

| Method | Path | Summary |
| --- | --- | --- |
| GET | /lol/clash/v1/players/by-puuid/{puuid} | Get players by puuid |
| GET | /lol/clash/v1/teams/{teamId} | Get team by ID. |
| GET | /lol/clash/v1/tournaments | Get all active or upcoming tournaments. |
| GET | /lol/clash/v1/tournaments/by-team/{teamId} | Get tournament by team ID. |
| GET | /lol/clash/v1/tournaments/{tournamentId} | Get tournament by ID. |

## league-exp-v4

| Method | Path | Summary |
| --- | --- | --- |
| GET | /lol/league-exp/v4/entries/{queue}/{tier}/{division} | Get all the league entries. |

## league-v4

| Method | Path | Summary |
| --- | --- | --- |
| GET | /lol/league/v4/challengerleagues/by-queue/{queue} | Get the challenger league for given queue. |
| GET | /lol/league/v4/entries/by-puuid/{encryptedPUUID} | Get league entries in all queues for a given puuid |
| GET | /lol/league/v4/entries/{queue}/{tier}/{division} | Get all the league entries. |
| GET | /lol/league/v4/grandmasterleagues/by-queue/{queue} | Get the grandmaster league of a specific queue. |
| GET | /lol/league/v4/leagues/{leagueId} | Get league with given ID, including inactive entries. |
| GET | /lol/league/v4/masterleagues/by-queue/{queue} | Get the master league for given queue. |

## lol-challenges-v1

| Method | Path | Summary |
| --- | --- | --- |
| GET | /lol/challenges/v1/challenges/config | List of all basic challenge configuration information (includes all translations for names and descriptions) |
| GET | /lol/challenges/v1/challenges/percentiles | Map of level to percentile of players who have achieved it - keys: ChallengeId -> Season -> Level -> percentile of players who achieved it |
| GET | /lol/challenges/v1/challenges/{challengeId}/config | Get challenge configuration (REST) |
| GET | /lol/challenges/v1/challenges/{challengeId}/leaderboards/by-level/{level} | Return top players for each level. Level must be MASTER, GRANDMASTER or CHALLENGER. |
| GET | /lol/challenges/v1/challenges/{challengeId}/percentiles | Map of level to percentile of players who have achieved it |
| GET | /lol/challenges/v1/player-data/{puuid} | Returns player information with list of all progressed challenges (REST) |

## lol-rso-match-v1

| Method | Path | Summary |
| --- | --- | --- |
| GET | /lol/rso-match/v1/matches/ids | Get a list of match ids by player access token - Includes custom matches |
| GET | /lol/rso-match/v1/matches/{matchId} | Get a match by match id |
| GET | /lol/rso-match/v1/matches/{matchId}/timeline | Get a match timeline by match id |

## lol-status-v4

| Method | Path | Summary |
| --- | --- | --- |
| GET | /lol/status/v4/platform-data | Get League of Legends status for the given platform. |

## lor-deck-v1

| Method | Path | Summary |
| --- | --- | --- |
| GET | /lor/deck/v1/decks/me | Get a list of the calling user's decks. |
| POST | /lor/deck/v1/decks/me | Create a new deck for the calling user. |

## lor-inventory-v1

| Method | Path | Summary |
| --- | --- | --- |
| GET | /lor/inventory/v1/cards/me | Return a list of cards owned by the calling user. |

## lor-match-v1

| Method | Path | Summary |
| --- | --- | --- |
| GET | /lor/match/v1/matches/by-puuid/{puuid}/ids | Get a list of match ids by PUUID |
| GET | /lor/match/v1/matches/{matchId} | Get match by id |

## lor-ranked-v1

| Method | Path | Summary |
| --- | --- | --- |
| GET | /lor/ranked/v1/leaderboards | Get the players in Master tier. |

## lor-status-v1

| Method | Path | Summary |
| --- | --- | --- |
| GET | /lor/status/v1/platform-data | Get Legends of Runeterra status for the given platform. |

## match-v5

| Method | Path | Summary |
| --- | --- | --- |
| GET | /lol/match/v5/matches/by-puuid/{puuid}/ids | Get a list of match ids by puuid |
| GET | /lol/match/v5/matches/by-puuid/{puuid}/replays | Get player replays |
| GET | /lol/match/v5/matches/{matchId} | Get a match by match id |
| GET | /lol/match/v5/matches/{matchId}/timeline | Get a match timeline by match id |

## riftbound-content-v1

| Method | Path | Summary |
| --- | --- | --- |
| GET | /riftbound/content/v1/contents | Get riftbound content |

## spectator-tft-v5

| Method | Path | Summary |
| --- | --- | --- |
| GET | /lol/spectator/tft/v5/active-games/by-puuid/{encryptedPUUID} | Get current game information for the given puuid. |

## spectator-v5

| Method | Path | Summary |
| --- | --- | --- |
| GET | /lol/spectator/v5/active-games/by-summoner/{encryptedPUUID} | Get current game information for the given puuid. |

## summoner-v4

| Method | Path | Summary |
| --- | --- | --- |
| GET | /lol/summoner/v4/summoners/by-puuid/{encryptedPUUID} | Get a summoner by PUUID. |
| GET | /lol/summoner/v4/summoners/me | Get a summoner by access token. |

## tft-league-v1

| Method | Path | Summary |
| --- | --- | --- |
| GET | /tft/league/v1/by-puuid/{puuid} | Get league entries in all queues for a given puuid |
| GET | /tft/league/v1/challenger | Get the challenger league. |
| GET | /tft/league/v1/entries/{tier}/{division} | Get all the league entries. |
| GET | /tft/league/v1/grandmaster | Get the grandmaster league. |
| GET | /tft/league/v1/leagues/{leagueId} | Get league with given ID, including inactive entries. |
| GET | /tft/league/v1/master | Get the master league. |
| GET | /tft/league/v1/rated-ladders/{queue}/top | Get the top rated ladder for given queue |

## tft-match-v1

| Method | Path | Summary |
| --- | --- | --- |
| GET | /tft/match/v1/matches/by-puuid/{puuid}/ids | Get a list of match ids by PUUID |
| GET | /tft/match/v1/matches/{matchId} | Get a match by match id |

## tft-status-v1

| Method | Path | Summary |
| --- | --- | --- |
| GET | /tft/status/v1/platform-data | Get Teamfight Tactics status for the given platform. |

## tft-summoner-v1

| Method | Path | Summary |
| --- | --- | --- |
| GET | /tft/summoner/v1/summoners/by-puuid/{encryptedPUUID} | Get a summoner by PUUID. |
| GET | /tft/summoner/v1/summoners/me | Get a summoner by access token. |

## tournament-stub-v5

| Method | Path | Summary |
| --- | --- | --- |
| GET | /lol/tournament-stub/v5/codes/{tournamentCode} | Returns the tournament code DTO associated with a tournament code string - Stub Method |
| GET | /lol/tournament-stub/v5/lobby-events/by-code/{tournamentCode} | Gets a list of lobby events by tournament code - Stub method |
| POST | /lol/tournament-stub/v5/codes | Create a tournament code for the given tournament - Stub method |
| POST | /lol/tournament-stub/v5/providers | Creates a tournament provider and returns its ID - Stub method |
| POST | /lol/tournament-stub/v5/tournaments | Creates a tournament and returns its ID - Stub method |

## tournament-v5

| Method | Path | Summary |
| --- | --- | --- |
| GET | /lol/tournament/v5/codes/{tournamentCode} | Returns the tournament code DTO associated with a tournament code string. |
| GET | /lol/tournament/v5/games/by-code/{tournamentCode} | Get games details |
| GET | /lol/tournament/v5/lobby-events/by-code/{tournamentCode} | Gets a list of lobby events by tournament code. |
| POST | /lol/tournament/v5/codes | Create a tournament code for the given tournament. |
| POST | /lol/tournament/v5/providers | Creates a tournament provider and returns its ID. |
| POST | /lol/tournament/v5/tournaments | Creates a tournament and returns its ID. |
| PUT | /lol/tournament/v5/codes/{tournamentCode} | Update the pick type, map, spectator type, or allowed puuids for a code. |

## val-console-match-v1

| Method | Path | Summary |
| --- | --- | --- |
| GET | /val/match/console/v1/matches/{matchId} | Get match by id |
| GET | /val/match/console/v1/matchlists/by-puuid/{puuid} | Get matchlist for games played by puuid and platform type |
| GET | /val/match/console/v1/recent-matches/by-queue/{queue} | Get recent matches |

## val-console-ranked-v1

| Method | Path | Summary |
| --- | --- | --- |
| GET | /val/console/ranked/v1/leaderboards/by-act/{actId} | Get leaderboard for the competitive queue |

## val-content-v1

| Method | Path | Summary |
| --- | --- | --- |
| GET | /val/content/v1/contents | Get content optionally filtered by locale |

## val-match-v1

| Method | Path | Summary |
| --- | --- | --- |
| GET | /val/match/v1/matches/{matchId} | Get match by id |
| GET | /val/match/v1/matchlists/by-puuid/{puuid} | Get matchlist for games played by puuid |
| GET | /val/match/v1/recent-matches/by-queue/{queue} | Get recent matches |

## val-ranked-v1

| Method | Path | Summary |
| --- | --- | --- |
| GET | /val/ranked/v1/leaderboards/by-act/{actId} | Get leaderboard for the competitive queue |

## val-status-v1

| Method | Path | Summary |
| --- | --- | --- |
| GET | /val/status/v1/platform-data | Get VALORANT status for the given platform. |

