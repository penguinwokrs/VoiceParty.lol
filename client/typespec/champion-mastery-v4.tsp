import "@typespec/http";
import "@typespec/rest";

using TypeSpec.Http;
using TypeSpec.Rest;

namespace ChampionMasteryV4;

model ChampionMasteryDto {
  puuid: string;
  championPointsUntilNextLevel: int64;
  chestGranted?: boolean;
  championId: int64;
  lastPlayTime: int64;
  championLevel: int32;
  championPoints: int32;
  championPointsSinceLastLevel: int64;
  markRequiredForNextLevel: int32;
  championSeasonMilestone: int32;
  nextSeasonMilestone: NextSeasonMilestonesDto;
  tokensEarned: int32;
  milestoneGrades?: string[];
}

model NextSeasonMilestonesDto {
  requireGradeCounts: Record<int32>;
  rewardMarks: int32;
  bonus: boolean;
  rewardConfig?: RewardConfigDto;
  totalGamesRequires: int32;
}

model RewardConfigDto {
  rewardValue: string;
  rewardType: string;
  maximumReward: int32;
}

interface ChampionMasteryV4Service {
  @route("/lol/champion-mastery/v4/champion-masteries/by-puuid/{encryptedPUUID}") @get
  getAllChampionMasteriesByPUUID(@path encryptedPUUID: string): ChampionMasteryDto[];

  @route("/lol/champion-mastery/v4/champion-masteries/by-puuid/{encryptedPUUID}/by-champion/{championId}") @get
  getChampionMasteryByPUUID(@path encryptedPUUID: string, @path championId: int32): ChampionMasteryDto;

  @route("/lol/champion-mastery/v4/champion-masteries/by-puuid/{encryptedPUUID}/top") @get
  getTopChampionMasteriesByPUUID(@path encryptedPUUID: string, @query count?: int32): ChampionMasteryDto[];

  @route("/lol/champion-mastery/v4/scores/by-puuid/{encryptedPUUID}") @get
  getChampionMasteryScoreByPUUID(@path encryptedPUUID: string): int32;

}
