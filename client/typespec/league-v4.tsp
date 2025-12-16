import "@typespec/http";
import "@typespec/rest";

using TypeSpec.Http;
using TypeSpec.Rest;

namespace LeagueV4;

model LeagueListDTO {
  leagueId?: string;
  entries: LeagueItemDTO[];
  tier: string;
  name?: string;
  queue?: string;
}

model LeagueItemDTO {
  freshBlood: boolean;
  wins: int32;
  miniSeries?: MiniSeriesDTO;
  inactive: boolean;
  veteran: boolean;
  hotStreak: boolean;
  rank: string;
  leaguePoints: int32;
  losses: int32;
  puuid: string;
  summonerId?: string;
}

model MiniSeriesDTO {
  losses: int32;
  progress: string;
  target: int32;
  wins: int32;
}

model LeagueEntryDTO {
  leagueId?: string;
  puuid: string;
  queueType: string;
  tier?: string;
  rank?: string;
  leaguePoints: int32;
  wins: int32;
  losses: int32;
  hotStreak: boolean;
  veteran: boolean;
  freshBlood: boolean;
  inactive: boolean;
  miniSeries?: MiniSeriesDTO;
  summonerId?: string;
}

interface LeagueV4Service {
  @route("/lol/league/v4/challengerleagues/by-queue/{queue}") @get
  getChallengerLeague(@path queue: string): LeagueListDTO;

  @route("/lol/league/v4/entries/by-puuid/{encryptedPUUID}") @get
  getLeagueEntriesByPUUID(@path encryptedPUUID: string): LeagueEntryDTO[];

  @route("/lol/league/v4/entries/{queue}/{tier}/{division}") @get
  getLeagueEntries(@path division: string, @path tier: string, @path queue: string, @query page?: int32): LeagueEntryDTO[];

  @route("/lol/league/v4/grandmasterleagues/by-queue/{queue}") @get
  getGrandmasterLeague(@path queue: string): LeagueListDTO;

  @route("/lol/league/v4/leagues/{leagueId}") @get
  getLeagueById(@path leagueId: string): LeagueListDTO;

  @route("/lol/league/v4/masterleagues/by-queue/{queue}") @get
  getMasterLeague(@path queue: string): LeagueListDTO;

}
