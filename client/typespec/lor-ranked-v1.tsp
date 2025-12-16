import "@typespec/http";
import "@typespec/rest";

using TypeSpec.Http;
using TypeSpec.Rest;

namespace LorRankedV1;

model LeaderboardDto {
  players: PlayerDto[];
}

model PlayerDto {
  name: string;
  rank: int32;
  lp: int32;
}

interface LorRankedV1Service {
  @route("/lor/ranked/v1/leaderboards") @get
  getLeaderboards(): LeaderboardDto;

}
