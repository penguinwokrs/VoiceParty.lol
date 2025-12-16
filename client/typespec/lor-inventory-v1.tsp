import "@typespec/http";
import "@typespec/rest";

using TypeSpec.Http;
using TypeSpec.Rest;

namespace LorInventoryV1;

model CardDto {
  code: string;
  count: string;
}

interface LorInventoryV1Service {
  @route("/lor/inventory/v1/cards/me") @get
  getCards(): CardDto[];

}
