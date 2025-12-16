import "@typespec/http";
import "@typespec/rest";

using TypeSpec.Http;
using TypeSpec.Rest;

namespace SpectatorV5;

model CurrentGameInfo {
  gameId: int64;
  gameType: string;
  gameStartTime: int64;
  mapId: int64;
  gameLength: int64;
  platformId: string;
  gameMode: string;
  bannedChampions: BannedChampion[];
  gameQueueConfigId?: int64;
  observers: Observer;
  participants: CurrentGameParticipant[];
}

model BannedChampion {
  pickTurn: int32;
  championId: int64;
  teamId: int64;
}

model Observer {
  encryptionKey: string;
}

model CurrentGameParticipant {
  championId: int64;
  perks?: Perks;
  profileIconId: int64;
  bot: boolean;
  teamId: int64;
  puuid?: string;
  spell1Id: int64;
  spell2Id: int64;
  gameCustomizationObjects: GameCustomizationObject[];
  riotId?: string;
}

model Perks {
  perkIds: int64[];
  perkStyle: int64;
  perkSubStyle: int64;
}

model GameCustomizationObject {
  category: string;
  content: string;
}

interface SpectatorV5Service {
  @route("/lol/spectator/v5/active-games/by-summoner/{encryptedPUUID}") @get
  getCurrentGameInfoByPuuid(@path encryptedPUUID: string): CurrentGameInfo;

}
