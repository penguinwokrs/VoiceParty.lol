import "@typespec/http";
import "@typespec/rest";

using TypeSpec.Http;
using TypeSpec.Rest;

namespace LorMatchV1;

model MatchDto {
  metadata: MetadataDto;
  info: InfoDto;
}

model MetadataDto {
  data_version: string;
  match_id: string;
  participants: string[];
}

model InfoDto {
  game_mode: string;
  game_type: string;
  game_start_time_utc: string;
  game_version: string;
  game_format: string;
  players: PlayerDto[];
  total_turn_count: int32;
}

model PlayerDto {
  puuid: string;
  deck_id: string;
  deck_code: string;
  factions: string[];
  game_outcome: string;
  order_of_play: int32;
}

interface LorMatchV1Service {
  @route("/lor/match/v1/matches/by-puuid/{puuid}/ids") @get
  getMatchIdsByPUUID(@path puuid: string): string[];

  @route("/lor/match/v1/matches/{matchId}") @get
  getMatch(@path matchId: string): MatchDto;

}
