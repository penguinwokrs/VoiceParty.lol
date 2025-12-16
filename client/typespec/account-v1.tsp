import "@typespec/http";
import "@typespec/rest";

using TypeSpec.Http;
using TypeSpec.Rest;

namespace AccountV1;

model AccountDto {
  puuid: string;
  gameName?: string;
  tagLine?: string;
}

model AccountRegionDTO {
  puuid: string;
  game: string;
  region: string;
}

model ActiveShardDto {
  puuid: string;
  game: string;
  activeShard: string;
}

interface AccountV1Service {
  @route("/riot/account/v1/accounts/by-puuid/{puuid}") @get
  getByPuuid(@path puuid: string): AccountDto;

  @route("/riot/account/v1/accounts/by-riot-id/{gameName}/{tagLine}") @get
  getByRiotId(@path tagLine: string, @path gameName: string): AccountDto;

  @route("/riot/account/v1/accounts/me") @get
  getByAccessToken(): AccountDto;

  @route("/riot/account/v1/active-shards/by-game/{game}/by-puuid/{puuid}") @get
  getActiveShard(@path game: string, @path puuid: string): ActiveShardDto;

  @route("/riot/account/v1/region/by-game/{game}/by-puuid/{puuid}") @get
  getActiveRegion(@path puuid: string, @path game: string): AccountRegionDTO;

}
