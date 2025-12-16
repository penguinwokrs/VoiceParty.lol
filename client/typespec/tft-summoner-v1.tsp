import "@typespec/http";
import "@typespec/rest";

using TypeSpec.Http;
using TypeSpec.Rest;

namespace TftSummonerV1;

model SummonerDTO {
  puuid: string;
  profileIconId: int32;
  revisionDate: int64;
  summonerLevel: int64;
  id?: string;
}

interface TftSummonerV1Service {
  @route("/tft/summoner/v1/summoners/by-puuid/{encryptedPUUID}") @get
  getByPUUID(@path encryptedPUUID: string): SummonerDTO;

  @route("/tft/summoner/v1/summoners/me") @get
  getByAccessToken(): SummonerDTO;

}
