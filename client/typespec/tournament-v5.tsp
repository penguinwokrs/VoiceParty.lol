import "@typespec/http";
import "@typespec/rest";

using TypeSpec.Http;
using TypeSpec.Rest;

namespace TournamentV5;

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
  id: int32;
  providerId: int32;
  tournamentId: int32;
  code: string;
  region: string;
  map: string;
  teamSize: int32;
  spectators: string;
  pickType: string;
  lobbyName: string;
  password: string;
  metaData: string;
  participants: string[];
}

model TournamentCodeUpdateParametersV5 {
  allowedParticipants?: string[];
  pickType: string;
  mapType: string;
  spectatorType: string;
}

model TournamentGamesV5 {
  startTime: int64;
  winningTeam: TournamentTeamV5[];
  losingTeam: TournamentTeamV5[];
  shortCode: string;
  metaData?: string;
  gameId: int64;
  gameName: string;
  gameType: string;
  gameMap: int32;
  gameMode: string;
  region: string;
}

model TournamentTeamV5 {
  puuid: string;
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

interface TournamentV5Service {
  @route("/lol/tournament/v5/codes") @post
  createTournamentCode(@query tournamentId: int64, @query count?: int32): string[];

  @route("/lol/tournament/v5/codes/{tournamentCode}") @get
  getTournamentCode(@path tournamentCode: string): TournamentCodeV5DTO;

  @route("/lol/tournament/v5/codes/{tournamentCode}") @put
  updateCode(@path tournamentCode: string): void;

  @route("/lol/tournament/v5/games/by-code/{tournamentCode}") @get
  getGames(@path tournamentCode: string): TournamentGamesV5[];

  @route("/lol/tournament/v5/lobby-events/by-code/{tournamentCode}") @get
  getLobbyEventsByCode(@path tournamentCode: string): LobbyEventV5DTOWrapper;

  @route("/lol/tournament/v5/providers") @post
  registerProviderData(): int32;

  @route("/lol/tournament/v5/tournaments") @post
  registerTournament(): int32;

}
