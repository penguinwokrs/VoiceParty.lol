import "@typespec/http";
import "@typespec/rest";

using TypeSpec.Http;
using TypeSpec.Rest;

namespace TftLeagueV1;

model LeagueEntryDTO {
  puuid?: string;
  leagueId?: string;
  queueType: string;
  ratedTier?: string;
  ratedRating?: int32;
  tier?: string;
  rank?: string;
  leaguePoints?: int32;
  wins: int32;
  losses: int32;
  hotStreak?: boolean;
  veteran?: boolean;
  freshBlood?: boolean;
  inactive?: boolean;
  miniSeries?: MiniSeriesDTO;
}

model MiniSeriesDTO {
  losses: int32;
  progress: string;
  target: int32;
  wins: int32;
}

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
}

model TopRatedLadderEntryDto {
  puuid: string;
  ratedTier: string;
  ratedRating: int32;
  wins: int32;
  previousUpdateLadderPosition: int32;
}

interface TftLeagueV1Service {
  @route("/tft/league/v1/by-puuid/{puuid}") @get
  getLeagueEntriesByPUUID(@path puuid: string): LeagueEntryDTO[];

  @route("/tft/league/v1/challenger") @get
  getChallengerLeague(@query queue?: string): LeagueListDTO;

  @route("/tft/league/v1/entries/{tier}/{division}") @get
  getLeagueEntries(@path tier: string, @path division: string, @query queue?: string, @query page?: int32): LeagueEntryDTO[];

  @route("/tft/league/v1/grandmaster") @get
  getGrandmasterLeague(@query queue?: string): LeagueListDTO;

  @route("/tft/league/v1/leagues/{leagueId}") @get
  getLeagueById(@path leagueId: string): LeagueListDTO;

  @route("/tft/league/v1/master") @get
  getMasterLeague(@query queue?: string): LeagueListDTO;

  @route("/tft/league/v1/rated-ladders/{queue}/top") @get
  getTopRatedLadder(@path queue: string): TopRatedLadderEntryDto[];

}
