import "@typespec/http";
import "@typespec/rest";

using TypeSpec.Http;
using TypeSpec.Rest;

namespace ClashV1;

model PlayerDto {
  puuid: string;
  teamId?: string;
  position: string;
  role: string;
}

model TeamDto {
  id: string;
  tournamentId: int32;
  name: string;
  iconId: int32;
  tier: int32;
  captain: string;
  abbreviation: string;
  players: PlayerDto[];
}

model TournamentDto {
  id: int32;
  themeId: int32;
  nameKey: string;
  nameKeySecondary: string;
  schedule: TournamentPhaseDto[];
}

model TournamentPhaseDto {
  id: int32;
  registrationTime: int64;
  startTime: int64;
  cancelled: boolean;
}

interface ClashV1Service {
  @route("/lol/clash/v1/players/by-puuid/{puuid}") @get
  getPlayersByPUUID(@path puuid: string): PlayerDto[];

  @route("/lol/clash/v1/teams/{teamId}") @get
  getTeamById(@path teamId: string): TeamDto;

  @route("/lol/clash/v1/tournaments") @get
  getTournaments(): TournamentDto[];

  @route("/lol/clash/v1/tournaments/by-team/{teamId}") @get
  getTournamentByTeam(@path teamId: string): TournamentDto;

  @route("/lol/clash/v1/tournaments/{tournamentId}") @get
  getTournamentById(@path tournamentId: int32): TournamentDto;

}
