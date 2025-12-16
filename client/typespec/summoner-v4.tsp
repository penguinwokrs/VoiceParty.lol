import "@typespec/http";
import "@typespec/rest";

using TypeSpec.Http;
using TypeSpec.Rest;

namespace SummonerV4;

model SummonerDTO {
  profileIconId: int32;
  revisionDate: int64;
  puuid: string;
  summonerLevel: int64;
  id?: string;
}

interface SummonerV4Service {
  @route("/lol/summoner/v4/summoners/by-puuid/{encryptedPUUID}") @get
  getByPUUID(@path encryptedPUUID: string): SummonerDTO;

  @route("/lol/summoner/v4/summoners/me") @get
  getByAccessToken(): SummonerDTO;

}
