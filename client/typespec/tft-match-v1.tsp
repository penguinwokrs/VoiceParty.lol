import "@typespec/http";
import "@typespec/rest";

using TypeSpec.Http;
using TypeSpec.Rest;

namespace TftMatchV1;

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
  endOfGameResult?: string;
  gameCreation?: int64;
  gameId?: int64;
  game_datetime: int64;
  game_length: float32;
  game_version: string;
  game_variation?: string;
  mapId?: int64;
  participants: ParticipantDto[];
  queue_id: int32;
  queueId?: int32;
  tft_game_type?: string;
  tft_set_core_name?: string;
  tft_set_number: int32;
}

model ParticipantDto {
  companion: CompanionDto;
  gold_left: int32;
  last_round: int32;
  level: int32;
  placement: int32;
  players_eliminated: int32;
  puuid: string;
  riotIdGameName?: string;
  riotIdTagline?: string;
  time_eliminated: float32;
  total_damage_to_players: int32;
  traits: TraitDto[];
  units: UnitDto[];
  win?: boolean;
  augments?: string[];
  partner_group_id?: int32;
  missions?: ParticipantMissionsDto;
  skill_tree?: Record<int32>;
  pve_score?: int32;
  pve_wonrun?: boolean;
}

model CompanionDto {
  content_ID: string;
  item_ID: int32;
  skin_ID: int32;
  species: string;
}

model TraitDto {
  name: string;
  num_units: int32;
  style?: int32;
  tier_current: int32;
  tier_total?: int32;
}

model UnitDto {
  items?: int32[];
  character_id: string;
  itemNames?: string[];
  chosen?: string;
  name: string;
  rarity: int32;
  tier: int32;
}

model ParticipantMissionsDto {
  Assists?: int32;
  DamageDealt?: int32;
  DamageDealtToObjectives?: int32;
  DamageDealtToTurrets?: int32;
  DamageTaken?: int32;
  DoubleKills?: int32;
  GoldEarned?: int32;
  GoldSpent?: int32;
  InhibitorsDestroyed?: int32;
  Kills?: int32;
  LargestKillingSpree?: int32;
  LargestMultiKill?: int32;
  MagicDamageDealt?: int32;
  MagicDamageDealtToChampions?: int32;
  NeutralMinionsKilledTeamJungle?: int32;
  PhysicalDamageDealt?: int32;
  PhysicalDamageTaken?: int32;
  PlayerScore0?: int32;
  PlayerScore1?: int32;
  PlayerScore2?: int32;
  PlayerScore3?: int32;
  PlayerScore4?: int32;
  PlayerScore5?: int32;
  PlayerScore6?: int32;
  PlayerScore9?: int32;
  PlayerScore10?: int32;
  PlayerScore11?: int32;
  QuadraKills?: int32;
  Spell1Casts?: int32;
  Spell2Casts?: int32;
  Spell3Casts?: int32;
  Spell4Casts?: int32;
  SummonerSpell1Casts?: int32;
  TimeCCOthers?: int32;
  TotalMinionsKilled?: int32;
  TrueDamageDealtToChampions?: int32;
  UnrealKills?: int32;
  VisionScore?: int32;
  WardsKilled?: int32;
  Deaths?: int32;
  KillingSprees?: int32;
  MagicDamageTaken?: int32;
  PentaKills?: int32;
  PhysicalDamageDealtToChampions?: int32;
  TotalDamageDealtToChampions?: int32;
  TripleKills?: int32;
  TrueDamageDealt?: int32;
  TrueDamageTaken?: int32;
}

interface TftMatchV1Service {
  @route("/tft/match/v1/matches/by-puuid/{puuid}/ids") @get
  getMatchIdsByPUUID(@path puuid: string, @query start?: int32, @query endTime?: int64, @query startTime?: int64, @query count?: int32): string[];

  @route("/tft/match/v1/matches/{matchId}") @get
  getMatch(@path matchId: string): MatchDto;

}
