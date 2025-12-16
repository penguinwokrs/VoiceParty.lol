import "@typespec/http";
import "@typespec/rest";

using TypeSpec.Http;
using TypeSpec.Rest;

namespace RiftboundContentV1;

model RiftboundContentDTO {
  game: string;
  version: string;
  lastUpdated: string;
  sets: SetDTO[];
}

model SetDTO {
  id: string;
  name: string;
  cards: CardDTO[];
}

model CardDTO {
  id: string;
  collectorNumber: int64;
  set: string;
  name: string;
  description: string;
  type: string;
  rarity: string;
  faction: string;
  stats: CardStatsDTO;
  keywords: string[];
  art: CardArtDTO;
  flavorText: string;
  tags: string[];
}

model CardStatsDTO {
  energy: int64;
  might: int64;
  cost: int64;
  power: int64;
}

model CardArtDTO {
  thumbnailURL: string;
  fullURL: string;
  artist: string;
}

interface RiftboundContentV1Service {
  @route("/riftbound/content/v1/contents") @get
  getContent(@query locale?: string): RiftboundContentDTO;

}
