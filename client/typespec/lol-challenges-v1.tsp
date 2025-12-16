import "@typespec/http";
import "@typespec/rest";

using TypeSpec.Http;
using TypeSpec.Rest;

namespace LolChallengesV1;

model ChallengeConfigInfoDto {
  id: int64;
  localizedNames: Record<Record<string>>;
  state: string;
  tracking?: string;
  startTimestamp?: int64;
  endTimestamp?: int64;
  leaderboard: boolean;
  thresholds: Record<float64>;
}

model State {
}

model Tracking {
}

model ApexPlayerInfoDto {
  puuid: string;
  value: float64;
  position: int32;
}

model Level {
}

model PlayerInfoDto {
  challenges: ChallengeInfoDto[];
  preferences: PlayerClientPreferencesDto;
  totalPoints: ChallengePointDto;
  categoryPoints: Record<ChallengePointDto>;
}

model ChallengeInfoDto {
  percentile: float64;
  playersInLevel?: int32;
  achievedTime?: int64;
  value: float64;
  challengeId: int64;
  level: string;
  position?: int32;
}

model PlayerClientPreferencesDto {
  bannerAccent?: string;
  title?: string;
  challengeIds?: int64[];
  crestBorder?: string;
  prestigeCrestBorderLevel?: int32;
}

model ChallengePointDto {
  level: string;
  current: int64;
  max: int64;
  percentile?: float64;
}

interface LolChallengesV1Service {
  @route("/lol/challenges/v1/challenges/config") @get
  getAllChallengeConfigs(): ChallengeConfigInfoDto[];

  @route("/lol/challenges/v1/challenges/percentiles") @get
  getAllChallengePercentiles(): Record<Record<float64>>;

  @route("/lol/challenges/v1/challenges/{challengeId}/config") @get
  getChallengeConfigs(@path challengeId: int64): ChallengeConfigInfoDto;

  @route("/lol/challenges/v1/challenges/{challengeId}/leaderboards/by-level/{level}") @get
  getChallengeLeaderboards(@path level: string, @path challengeId: int64, @query limit?: int32): ApexPlayerInfoDto[];

  @route("/lol/challenges/v1/challenges/{challengeId}/percentiles") @get
  getChallengePercentiles(@path challengeId: int64): Record<float64>;

  @route("/lol/challenges/v1/player-data/{puuid}") @get
  getPlayerData(@path puuid: string): PlayerInfoDto;

}
