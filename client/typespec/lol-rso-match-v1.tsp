import "@typespec/http";
import "@typespec/rest";

using TypeSpec.Http;
using TypeSpec.Rest;

namespace LolRsoMatchV1;

model MatchDto {
}

model TimelineDto {
}

interface LolRsoMatchV1Service {
  @route("/lol/rso-match/v1/matches/ids") @get
  getMatchIds(@query count?: int32, @query start?: int32, @query type?: string, @query queue?: int32, @query endTime?: int64, @query startTime?: int64): string[];

  @route("/lol/rso-match/v1/matches/{matchId}") @get
  getMatch(@path matchId: string): MatchV5.MatchDto;

  @route("/lol/rso-match/v1/matches/{matchId}/timeline") @get
  getTimeline(@path matchId: string): MatchV5.TimelineDto;

}
