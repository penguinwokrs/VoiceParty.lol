import "@typespec/http";
import "@typespec/rest";

using TypeSpec.Http;
using TypeSpec.Rest;

namespace ValContentV1;

model ContentDto {
  version: string;
  characters: ContentItemDto[];
  maps: ContentItemDto[];
  chromas: ContentItemDto[];
  skins: ContentItemDto[];
  skinLevels: ContentItemDto[];
  equips: ContentItemDto[];
  gameModes: ContentItemDto[];
  sprays: ContentItemDto[];
  sprayLevels: ContentItemDto[];
  charms: ContentItemDto[];
  charmLevels: ContentItemDto[];
  playerCards: ContentItemDto[];
  playerTitles: ContentItemDto[];
  acts: ActDto[];
  ceremonies?: ContentItemDto[];
  totems?: ContentItemDto[];
}

model ContentItemDto {
  name: string;
  localizedNames?: LocalizedNamesDto;
  id: string;
  assetName: string;
  assetPath?: string;
}

model LocalizedNamesDto {
  "ar-AE": string;
  "de-DE": string;
  "en-GB"?: string;
  "en-US": string;
  "es-ES": string;
  "es-MX": string;
  "fr-FR": string;
  "id-ID": string;
  "it-IT": string;
  "ja-JP": string;
  "ko-KR": string;
  "pl-PL": string;
  "pt-BR": string;
  "ru-RU": string;
  "th-TH": string;
  "tr-TR": string;
  "vi-VN": string;
  "zh-CN": string;
  "zh-TW": string;
}

model ActDto {
  name: string;
  localizedNames?: LocalizedNamesDto;
  id: string;
  isActive: boolean;
  parentId?: string;
  type?: string;
}

interface ValContentV1Service {
  @route("/val/content/v1/contents") @get
  getContent(@query locale?: string): ContentDto;

}
