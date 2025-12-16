import "@typespec/http";
import "@typespec/rest";

using TypeSpec.Http;
using TypeSpec.Rest;

namespace ValStatusV1;

model PlatformDataDto {
  id: string;
  name: string;
  locales: string[];
  maintenances: StatusDto[];
  incidents: StatusDto[];
}

model StatusDto {
  id: int32;
  maintenance_status: string;
  incident_severity: string;
  titles: ContentDto[];
  updates: UpdateDto[];
  created_at: string;
  archive_at: string;
  updated_at: string;
  platforms: string[];
}

model ContentDto {
  locale: string;
  content: string;
}

model UpdateDto {
  id: int32;
  author: string;
  publish: boolean;
  publish_locations: string[];
  translations: ContentDto[];
  created_at: string;
  updated_at: string;
}

interface ValStatusV1Service {
  @route("/val/status/v1/platform-data") @get
  getPlatformData(): PlatformDataDto;

}
