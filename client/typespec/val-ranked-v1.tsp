import "@typespec/http";
import "@typespec/rest";

using TypeSpec.Http;
using TypeSpec.Rest;

namespace ValRankedV1;

model LeaderboardDto {
  shard: string;
  actId: string;
  totalPlayers: int64;
  players: PlayerDto[];
  immortalStartingPage?: int64;
  immortalStartingIndex?: int64;
  topTierRRThreshold?: int64;
  tierDetails?: Record<TierDetailDto>;
  startIndex?: int64;
  query?: string;
}

model PlayerDto {
  puuid?: string;
  gameName?: string;
  tagLine?: string;
  leaderboardRank: int64;
  rankedRating: int64;
  numberOfWins: int64;
  competitiveTier?: int64;
  prefix?: string;
}

model TierDetailDto {
  rankedRatingThreshold: int64;
  startingPage: int64;
  startingIndex: int64;
}

interface ValRankedV1Service {
  @route("/val/ranked/v1/leaderboards/by-act/{actId}") @get
  getLeaderboard(@path actId: string, @query size?: int32, @query startIndex?: int32): LeaderboardDto;

}
