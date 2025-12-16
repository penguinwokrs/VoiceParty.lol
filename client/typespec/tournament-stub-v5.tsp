import "@typespec/http";
import "@typespec/rest";

using TypeSpec.Http;
using TypeSpec.Rest;

namespace TournamentStubV5;

model TournamentCodeParametersV5 {
  allowedParticipants?: string[];
  metadata?: string;
  teamSize: int32;
  pickType: string;
  mapType: string;
  spectatorType: string;
  enoughPlayers: boolean;
}

model TournamentCodeV5DTO {
  code: string;
  lobbyName: string;
  metaData: string;
  password: string;
  teamSize: int32;
  providerId: int32;
  pickType: string;
  tournamentId: int32;
  id: int32;
  region: string;
  map: string;
  participants: string[];
}

model LobbyEventV5DTOWrapper {
  eventList: LobbyEventV5DTO[];
}

model LobbyEventV5DTO {
  timestamp: string;
  eventType: string;
  puuid: string;
}

model ProviderRegistrationParametersV5 {
  region: string;
  url: string;
}

model TournamentRegistrationParametersV5 {
  providerId: int32;
  name?: string;
}

interface TournamentStubV5Service {
  @route("/lol/tournament-stub/v5/codes") @post
  createTournamentCode(@query count?: int32, @query tournamentId: int64): string[];

  @route("/lol/tournament-stub/v5/codes/{tournamentCode}") @get
  getTournamentCode(@path tournamentCode: string): TournamentCodeV5DTO;

  @route("/lol/tournament-stub/v5/lobby-events/by-code/{tournamentCode}") @get
  getLobbyEventsByCode(@path tournamentCode: string): LobbyEventV5DTOWrapper;

  @route("/lol/tournament-stub/v5/providers") @post
  registerProviderData(): int32;

  @route("/lol/tournament-stub/v5/tournaments") @post
  registerTournament(): int32;

}
