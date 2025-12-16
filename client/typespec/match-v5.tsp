import "@typespec/http";
import "@typespec/rest";

using TypeSpec.Http;
using TypeSpec.Rest;

namespace MatchV5;

model ReplayDTO {
  total: int32;
  matchFileURLs: string[];
}

model MatchDto {
  metadata: MetadataDto;
  info: InfoDto;
}

model MetadataDto {
  dataVersion: string;
  matchId: string;
  participants: string[];
}

model InfoDto {
  endOfGameResult?: string;
  gameCreation: int64;
  gameDuration: int64;
  gameEndTimestamp?: int64;
  gameId: int64;
  gameMode: string;
  gameName: string;
  gameStartTimestamp: int64;
  gameType: string;
  gameVersion: string;
  mapId: int32;
  participants: ParticipantDto[];
  platformId: string;
  queueId: int32;
  teams: TeamDto[];
  tournamentCode?: string;
  gameModeMutators?: string[];
}

model ParticipantDto {
  allInPings?: int32;
  assistMePings?: int32;
  assists: int32;
  baronKills: int32;
  bountyLevel?: int32;
  champExperience: int32;
  champLevel: int32;
  championId: int32;
  championName: string;
  commandPings?: int32;
  championTransform: int32;
  consumablesPurchased: int32;
  challenges?: ChallengesDto;
  damageDealtToBuildings?: int32;
  damageDealtToObjectives: int32;
  damageDealtToTurrets: int32;
  damageSelfMitigated: int32;
  deaths: int32;
  detectorWardsPlaced: int32;
  doubleKills: int32;
  dragonKills: int32;
  eligibleForProgression?: boolean;
  enemyMissingPings?: int32;
  enemyVisionPings?: int32;
  firstBloodAssist: boolean;
  firstBloodKill: boolean;
  firstTowerAssist: boolean;
  firstTowerKill: boolean;
  gameEndedInEarlySurrender: boolean;
  gameEndedInSurrender: boolean;
  holdPings?: int32;
  getBackPings?: int32;
  goldEarned: int32;
  goldSpent: int32;
  individualPosition: string;
  inhibitorKills: int32;
  inhibitorTakedowns?: int32;
  inhibitorsLost?: int32;
  item0: int32;
  item1: int32;
  item2: int32;
  item3: int32;
  item4: int32;
  item5: int32;
  item6: int32;
  itemsPurchased: int32;
  killingSprees: int32;
  kills: int32;
  lane: string;
  largestCriticalStrike: int32;
  largestKillingSpree: int32;
  largestMultiKill: int32;
  longestTimeSpentLiving: int32;
  magicDamageDealt: int32;
  magicDamageDealtToChampions: int32;
  magicDamageTaken: int32;
  missions?: MissionsDto;
  neutralMinionsKilled: int32;
  needVisionPings?: int32;
  nexusKills: int32;
  nexusTakedowns?: int32;
  nexusLost?: int32;
  objectivesStolen: int32;
  objectivesStolenAssists: int32;
  onMyWayPings?: int32;
  participantId: int32;
  playerScore0?: float32;
  playerScore1?: float32;
  playerScore2?: float32;
  playerScore3?: float32;
  playerScore4?: float32;
  playerScore5?: float32;
  playerScore6?: float32;
  playerScore7?: float32;
  playerScore8?: float32;
  playerScore9?: float32;
  playerScore10?: float32;
  playerScore11?: float32;
  pentaKills: int32;
  perks: PerksDto;
  physicalDamageDealt: int32;
  physicalDamageDealtToChampions: int32;
  physicalDamageTaken: int32;
  placement?: int32;
  playerAugment1?: int32;
  playerAugment2?: int32;
  playerAugment3?: int32;
  playerAugment4?: int32;
  playerSubteamId?: int32;
  pushPings?: int32;
  profileIcon: int32;
  puuid: string;
  quadraKills: int32;
  riotIdGameName?: string;
  riotIdTagline?: string;
  role: string;
  sightWardsBoughtInGame: int32;
  spell1Casts: int32;
  spell2Casts: int32;
  spell3Casts: int32;
  spell4Casts: int32;
  subteamPlacement?: int32;
  summoner1Casts: int32;
  summoner1Id: int32;
  summoner2Casts: int32;
  summoner2Id: int32;
  summonerId: string;
  summonerLevel: int32;
  summonerName: string;
  teamEarlySurrendered: boolean;
  teamId: int32;
  teamPosition: string;
  timeCCingOthers: int32;
  timePlayed: int32;
  totalAllyJungleMinionsKilled?: int32;
  totalDamageDealt: int32;
  totalDamageDealtToChampions: int32;
  totalDamageShieldedOnTeammates: int32;
  totalDamageTaken: int32;
  totalEnemyJungleMinionsKilled?: int32;
  totalHeal: int32;
  totalHealsOnTeammates: int32;
  totalMinionsKilled: int32;
  totalTimeCCDealt: int32;
  totalTimeSpentDead: int32;
  totalUnitsHealed: int32;
  tripleKills: int32;
  trueDamageDealt: int32;
  trueDamageDealtToChampions: int32;
  trueDamageTaken: int32;
  turretKills: int32;
  turretTakedowns?: int32;
  turretsLost?: int32;
  unrealKills: int32;
  visionScore: int32;
  visionClearedPings?: int32;
  visionWardsBoughtInGame: int32;
  wardsKilled: int32;
  wardsPlaced: int32;
  win: boolean;
  baitPings?: int32;
  dangerPings?: int32;
  basicPings?: int32;
  playerAugment5?: int32;
  playerAugment6?: int32;
  riotIdName?: string;
  retreatPings?: int32;
  championSkinId?: int32;
  damageDealtToEpicMonsters?: int32;
}

model ChallengesDto {
  "12AssistStreakCount"?: int32;
  baronBuffGoldAdvantageOverThreshold?: int32;
  controlWardTimeCoverageInRiverOrEnemyHalf?: float32;
  earliestBaron?: float64;
  earliestDragonTakedown?: float64;
  earliestElderDragon?: float64;
  earlyLaningPhaseGoldExpAdvantage?: float64;
  fasterSupportQuestCompletion?: int32;
  fastestLegendary?: float64;
  hadAfkTeammate?: int32;
  highestChampionDamage?: int32;
  highestCrowdControlScore?: int32;
  highestWardKills?: int32;
  junglerKillsEarlyJungle?: int32;
  killsOnLanersEarlyJungleAsJungler?: int32;
  laningPhaseGoldExpAdvantage?: int32;
  legendaryCount?: int32;
  maxCsAdvantageOnLaneOpponent?: float32;
  maxLevelLeadLaneOpponent?: int32;
  mostWardsDestroyedOneSweeper?: int32;
  mythicItemUsed?: int32;
  playedChampSelectPosition?: int32;
  soloTurretsLategame?: int32;
  takedownsFirst25Minutes?: int32;
  teleportTakedowns?: int32;
  thirdInhibitorDestroyedTime?: float64;
  threeWardsOneSweeperCount?: int32;
  visionScoreAdvantageLaneOpponent?: float32;
  InfernalScalePickup?: int32;
  fistBumpParticipation?: int32;
  voidMonsterKill?: int32;
  abilityUses?: int32;
  acesBefore15Minutes?: int32;
  alliedJungleMonsterKills?: float32;
  baronTakedowns?: int32;
  blastConeOppositeOpponentCount?: int32;
  bountyGold?: float64;
  buffsStolen?: int32;
  completeSupportQuestInTime?: int32;
  controlWardsPlaced?: int32;
  damagePerMinute?: float32;
  damageTakenOnTeamPercentage?: float32;
  dancedWithRiftHerald?: int32;
  deathsByEnemyChamps?: int32;
  dodgeSkillShotsSmallWindow?: int32;
  doubleAces?: int32;
  dragonTakedowns?: int32;
  legendaryItemUsed?: int32[];
  effectiveHealAndShielding?: float32;
  elderDragonKillsWithOpposingSoul?: int32;
  elderDragonMultikills?: int32;
  enemyChampionImmobilizations?: int32;
  enemyJungleMonsterKills?: float32;
  epicMonsterKillsNearEnemyJungler?: int32;
  epicMonsterKillsWithin30SecondsOfSpawn?: int32;
  epicMonsterSteals?: int32;
  epicMonsterStolenWithoutSmite?: int32;
  firstTurretKilled?: float64;
  firstTurretKilledTime?: float32;
  flawlessAces?: int32;
  fullTeamTakedown?: int32;
  gameLength?: float32;
  getTakedownsInAllLanesEarlyJungleAsLaner?: int32;
  goldPerMinute?: float32;
  hadOpenNexus?: int32;
  immobilizeAndKillWithAlly?: int32;
  initialBuffCount?: int32;
  initialCrabCount?: int32;
  jungleCsBefore10Minutes?: float32;
  junglerTakedownsNearDamagedEpicMonster?: int32;
  kda?: float32;
  killAfterHiddenWithAlly?: int32;
  killedChampTookFullTeamDamageSurvived?: int32;
  killingSprees?: int32;
  killParticipation?: float32;
  killsNearEnemyTurret?: int32;
  killsOnOtherLanesEarlyJungleAsLaner?: int32;
  killsOnRecentlyHealedByAramPack?: int32;
  killsUnderOwnTurret?: int32;
  killsWithHelpFromEpicMonster?: int32;
  knockEnemyIntoTeamAndKill?: int32;
  kTurretsDestroyedBeforePlatesFall?: int32;
  landSkillShotsEarlyGame?: int32;
  laneMinionsFirst10Minutes?: int32;
  lostAnInhibitor?: int32;
  maxKillDeficit?: int32;
  mejaisFullStackInTime?: int32;
  moreEnemyJungleThanOpponent?: float32;
  multiKillOneSpell?: int32;
  multikills?: int32;
  multikillsAfterAggressiveFlash?: int32;
  multiTurretRiftHeraldCount?: int32;
  outerTurretExecutesBefore10Minutes?: int32;
  outnumberedKills?: int32;
  outnumberedNexusKill?: int32;
  perfectDragonSoulsTaken?: int32;
  perfectGame?: int32;
  pickKillWithAlly?: int32;
  poroExplosions?: int32;
  quickCleanse?: int32;
  quickFirstTurret?: int32;
  quickSoloKills?: int32;
  riftHeraldTakedowns?: int32;
  saveAllyFromDeath?: int32;
  scuttleCrabKills?: int32;
  shortestTimeToAceFromFirstTakedown?: float32;
  skillshotsDodged?: int32;
  skillshotsHit?: int32;
  snowballsHit?: int32;
  soloBaronKills?: int32;
  SWARM_DefeatAatrox?: int32;
  SWARM_DefeatBriar?: int32;
  SWARM_DefeatMiniBosses?: int32;
  SWARM_EvolveWeapon?: int32;
  SWARM_Have3Passives?: int32;
  SWARM_KillEnemy?: int32;
  SWARM_PickupGold?: float32;
  SWARM_ReachLevel50?: int32;
  SWARM_Survive15Min?: int32;
  SWARM_WinWith5EvolvedWeapons?: int32;
  soloKills?: int32;
  stealthWardsPlaced?: int32;
  survivedSingleDigitHpCount?: int32;
  survivedThreeImmobilizesInFight?: int32;
  takedownOnFirstTurret?: int32;
  takedowns?: int32;
  takedownsAfterGainingLevelAdvantage?: int32;
  takedownsBeforeJungleMinionSpawn?: int32;
  takedownsFirstXMinutes?: int32;
  takedownsInAlcove?: int32;
  takedownsInEnemyFountain?: int32;
  teamBaronKills?: int32;
  teamDamagePercentage?: float32;
  teamElderDragonKills?: int32;
  teamRiftHeraldKills?: int32;
  tookLargeDamageSurvived?: int32;
  turretPlatesTaken?: int32;
  turretsTakenWithRiftHerald?: int32;
  turretTakedowns?: int32;
  twentyMinionsIn3SecondsCount?: int32;
  twoWardsOneSweeperCount?: int32;
  unseenRecalls?: int32;
  visionScorePerMinute?: float32;
  wardsGuarded?: int32;
  wardTakedowns?: int32;
  wardTakedownsBefore20M?: int32;
  HealFromMapSources?: float64;
}

model MissionsDto {
  playerScore0?: float32;
  playerScore1?: float32;
  playerScore2?: float32;
  playerScore3?: float32;
  playerScore4?: float32;
  playerScore5?: float32;
  playerScore6?: float32;
  playerScore7?: float32;
  playerScore8?: float32;
  playerScore9?: float32;
  playerScore10?: float32;
  playerScore11?: float32;
}

model PerksDto {
  statPerks: PerkStatsDto;
  styles: PerkStyleDto[];
}

model PerkStatsDto {
  defense: int32;
  flex: int32;
  offense: int32;
}

model PerkStyleDto {
  description: string;
  selections: PerkStyleSelectionDto[];
  style: int32;
}

model PerkStyleSelectionDto {
  perk: int32;
  var1: int32;
  var2: int32;
  var3: int32;
}

model TeamDto {
  bans: BanDto[];
  objectives: ObjectivesDto;
  teamId: int32;
  win: boolean;
  feats?: FeatsDto;
}

model BanDto {
  championId: int32;
  pickTurn: int32;
}

model ObjectivesDto {
  baron: ObjectiveDto;
  champion: ObjectiveDto;
  dragon: ObjectiveDto;
  horde?: ObjectiveDto;
  inhibitor: ObjectiveDto;
  riftHerald: ObjectiveDto;
  tower: ObjectiveDto;
  atakhan?: ObjectiveDto;
}

model ObjectiveDto {
  first: boolean;
  kills: int32;
}

model TimelineDto {
  metadata: MetadataTimeLineDto;
  info: InfoTimeLineDto;
}

model MetadataTimeLineDto {
  dataVersion: string;
  matchId: string;
  participants: string[];
}

model InfoTimeLineDto {
  endOfGameResult?: string;
  frameInterval: int64;
  gameId?: int64;
  participants?: ParticipantTimeLineDto[];
  frames: FramesTimeLineDto[];
}

model ParticipantTimeLineDto {
  participantId: int32;
  puuid: string;
}

model FramesTimeLineDto {
  events: EventsTimeLineDto[];
  participantFrames?: Record<ParticipantFrameDto>;
  timestamp: int32;
}

model EventsTimeLineDto {
  timestamp: int64;
  realTimestamp?: int64;
  type: string;
  itemId?: int32;
  participantId?: int32;
  levelUpType?: string;
  skillSlot?: int32;
  creatorId?: int32;
  wardType?: string;
  level?: int32;
  assistingParticipantIds?: int32[];
  bounty?: int32;
  killStreakLength?: int32;
  killerId?: int32;
  position?: PositionDto;
  victimDamageDealt?: MatchTimelineVictimDamage[];
  victimDamageReceived?: MatchTimelineVictimDamage[];
  victimId?: int32;
  killType?: string;
  laneType?: string;
  teamId?: int32;
  multiKillLength?: int32;
  killerTeamId?: int32;
  monsterType?: string;
  monsterSubType?: string;
  buildingType?: string;
  towerType?: string;
  afterId?: int32;
  beforeId?: int32;
  goldGain?: int32;
  gameId?: int64;
  winningTeam?: int32;
  transformType?: string;
  name?: string;
  shutdownBounty?: int32;
  actualStartTime?: int64;
  featType?: int32;
  featValue?: int32;
}

model ParticipantFramesDto {
  "1-9": ParticipantFrameDto;
}

model ParticipantFrameDto {
  championStats: ChampionStatsDto;
  currentGold: int32;
  damageStats: DamageStatsDto;
  goldPerSecond: int32;
  jungleMinionsKilled: int32;
  level: int32;
  minionsKilled: int32;
  participantId: int32;
  position: PositionDto;
  timeEnemySpentControlled: int32;
  totalGold: int32;
  xp: int32;
}

model ChampionStatsDto {
  abilityHaste?: int32;
  abilityPower: int32;
  armor: int32;
  armorPen: int32;
  armorPenPercent: int32;
  attackDamage: int32;
  attackSpeed: int32;
  bonusArmorPenPercent: int32;
  bonusMagicPenPercent: int32;
  ccReduction: int32;
  cooldownReduction: int32;
  health: int32;
  healthMax: int32;
  healthRegen: int32;
  lifesteal: int32;
  magicPen: int32;
  magicPenPercent: int32;
  magicResist: int32;
  movementSpeed: int32;
  omnivamp?: int32;
  physicalVamp?: int32;
  power: int32;
  powerMax: int32;
  powerRegen: int32;
  spellVamp: int32;
}

model DamageStatsDto {
  magicDamageDone: int32;
  magicDamageDoneToChampions: int32;
  magicDamageTaken: int32;
  physicalDamageDone: int32;
  physicalDamageDoneToChampions: int32;
  physicalDamageTaken: int32;
  totalDamageDone: int32;
  totalDamageDoneToChampions: int32;
  totalDamageTaken: int32;
  trueDamageDone: int32;
  trueDamageDoneToChampions: int32;
  trueDamageTaken: int32;
}

model PositionDto {
  x: int32;
  y: int32;
}

model FeatsDto {
  EPIC_MONSTER_KILL?: FeatDto;
  FIRST_BLOOD?: FeatDto;
  FIRST_TURRET?: FeatDto;
}

model MatchTimelineVictimDamage {
  basic: boolean;
  magicDamage: int32;
  name: string;
  participantId: int32;
  physicalDamage: int32;
  spellName: string;
  spellSlot: int32;
  trueDamage: int32;
  type: string;
}

model FeatDto {
  featState?: int32;
}

interface MatchV5Service {
  @route("/lol/match/v5/matches/by-puuid/{puuid}/ids") @get
  getMatchIdsByPUUID(@path puuid: string, @query startTime?: int64, @query endTime?: int64, @query queue?: int32, @query type?: string, @query start?: int32, @query count?: int32): string[];

  @route("/lol/match/v5/matches/by-puuid/{puuid}/replays") @get
  getReplay(@path puuid: string): ReplayDTO;

  @route("/lol/match/v5/matches/{matchId}") @get
  getMatch(@path matchId: string): MatchDto;

  @route("/lol/match/v5/matches/{matchId}/timeline") @get
  getTimeline(@path matchId: string): TimelineDto;

}
