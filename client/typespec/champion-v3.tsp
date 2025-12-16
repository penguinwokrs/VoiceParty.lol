import "@typespec/http";
import "@typespec/rest";

using TypeSpec.Http;
using TypeSpec.Rest;

namespace ChampionV3;

model ChampionInfo {
  maxNewPlayerLevel: int32;
  freeChampionIdsForNewPlayers: int32[];
  freeChampionIds: int32[];
}

interface ChampionV3Service {
  @route("/lol/platform/v3/champion-rotations") @get
  getChampionInfo(): ChampionInfo;

}
