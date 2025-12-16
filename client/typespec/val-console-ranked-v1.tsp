import "@typespec/http";
import "@typespec/rest";

using TypeSpec.Http;
using TypeSpec.Rest;

namespace ValConsoleRankedV1;

model LeaderboardDto {
  actId: string;
  totalPlayers: int64;
  query?: string;
  shard: string;
  players: PlayerDto[];
  tierDetails?: TierDto[];
}

model PlayerDto {
  puuid?: string;
  gameName?: string;
  tagLine?: string;
  leaderboardRank: int64;
  rankedRating: int64;
  numberOfWins: int64;
}

model TierDto {
}

interface ValConsoleRankedV1Service {
  @route("/val/console/ranked/v1/leaderboards/by-act/{actId}") @get
  getLeaderboard(@path actId: string, @query platformType: string, @query startIndex?: int32, @query size?: int32): LeaderboardDto;

}
