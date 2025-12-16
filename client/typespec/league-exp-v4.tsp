import "@typespec/http";
import "@typespec/rest";

using TypeSpec.Http;
using TypeSpec.Rest;

namespace LeagueExpV4;

model LeagueEntryDTO {
  leagueId: string;
  summonerId?: string;
  puuid: string;
  queueType: string;
  tier: string;
  rank: string;
  leaguePoints: int32;
  wins: int32;
  losses: int32;
  hotStreak: boolean;
  veteran: boolean;
  freshBlood: boolean;
  inactive: boolean;
  miniSeries?: MiniSeriesDTO;
}

model MiniSeriesDTO {
  losses: int32;
  progress: string;
  target: int32;
  wins: int32;
}

interface LeagueExpV4Service {
  @route("/lol/league-exp/v4/entries/{queue}/{tier}/{division}") @get
  getLeagueEntries(@path queue: string, @path tier: string, @path division: string, @query page?: int32): LeagueEntryDTO[];

}
