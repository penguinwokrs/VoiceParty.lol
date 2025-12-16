import "@typespec/http";
import "@typespec/rest";

using TypeSpec.Http;
using TypeSpec.Rest;

namespace ValConsoleMatchV1;

model MatchDto {
  matchInfo: MatchInfoDto;
  players: PlayerDto[];
  coaches: CoachDto[];
  teams?: TeamDto[];
  roundResults?: RoundResultDto[];
}

model MatchInfoDto {
  matchId: string;
  mapId: string;
  gameLengthMillis?: int32;
  gameStartMillis: int64;
  provisioningFlowId: string;
  isCompleted: boolean;
  customGameName: string;
  queueId: string;
  gameMode: string;
  isRanked: boolean;
  seasonId: string;
}

model PlayerDto {
  puuid: string;
  gameName: string;
  tagLine: string;
  teamId: string;
  partyId: string;
  characterId?: string;
  stats?: PlayerStatsDto;
  competitiveTier: int32;
  playerCard: string;
  playerTitle: string;
}

model PlayerStatsDto {
  score: int32;
  roundsPlayed: int32;
  kills: int32;
  deaths: int32;
  assists: int32;
  playtimeMillis: int32;
  abilityCasts?: AbilityCastsDto;
}

model AbilityCastsDto {
  grenadeCasts: int32;
  ability1Casts: int32;
  ability2Casts: int32;
  ultimateCasts: int32;
}

model CoachDto {
  puuid: string;
  teamId: string;
}

model TeamDto {
  teamId: string;
  won: boolean;
  roundsPlayed: int32;
  roundsWon: int32;
  numPoints: int32;
}

model RoundResultDto {
  roundNum: int32;
  roundResult: string;
  roundCeremony: string;
  winningTeam: string;
  bombPlanter?: string;
  bombDefuser?: string;
  plantRoundTime: int32;
  plantPlayerLocations?: PlayerLocationsDto[];
  plantLocation: LocationDto;
  plantSite: string;
  defuseRoundTime: int32;
  defusePlayerLocations?: PlayerLocationsDto[];
  defuseLocation: LocationDto;
  playerStats: PlayerRoundStatsDto[];
  roundResultCode: string;
}

model PlayerLocationsDto {
  puuid: string;
  viewRadians: float32;
  location: LocationDto;
}

model LocationDto {
  x: int32;
  y: int32;
}

model PlayerRoundStatsDto {
  puuid: string;
  kills: KillDto[];
  damage: DamageDto[];
  score: int32;
  economy: EconomyDto;
  ability: AbilityDto;
}

model KillDto {
  timeSinceGameStartMillis: int32;
  timeSinceRoundStartMillis: int32;
  killer: string;
  victim: string;
  victimLocation: LocationDto;
  assistants: string[];
  playerLocations: PlayerLocationsDto[];
  finishingDamage: FinishingDamageDto;
}

model FinishingDamageDto {
  damageType: string;
  damageItem: string;
  isSecondaryFireMode: boolean;
}

model DamageDto {
  receiver: string;
  damage: int32;
  legshots: int32;
  bodyshots: int32;
  headshots: int32;
}

model EconomyDto {
  loadoutValue: int32;
  weapon: string;
  armor: string;
  remaining: int32;
  spent: int32;
}

model AbilityDto {
  grenadeEffects?: string;
  ability1Effects?: string;
  ability2Effects?: string;
  ultimateEffects?: string;
}

model MatchlistDto {
  puuid: string;
  history: MatchlistEntryDto[];
}

model MatchlistEntryDto {
  matchId: string;
  gameStartTimeMillis: int64;
  queueId: string;
}

model RecentMatchesDto {
  currentTime: int64;
  matchIds: string[];
}

interface ValConsoleMatchV1Service {
  @route("/val/match/console/v1/matches/{matchId}") @get
  getMatch(@path matchId: string): MatchDto;

  @route("/val/match/console/v1/matchlists/by-puuid/{puuid}") @get
  getMatchlist(@path puuid: string, @query platformType: string): MatchlistDto;

  @route("/val/match/console/v1/recent-matches/by-queue/{queue}") @get
  getRecent(@path queue: string): RecentMatchesDto;

}
