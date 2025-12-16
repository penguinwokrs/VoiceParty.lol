import "@typespec/http";
import "@typespec/rest";

using TypeSpec.Http;
using TypeSpec.Rest;

namespace LorDeckV1;

model DeckDto {
  id: string;
  name: string;
  code: string;
}

model NewDeckDto {
  name: string;
  code: string;
}

interface LorDeckV1Service {
  @route("/lor/deck/v1/decks/me") @get
  getDecks(): DeckDto[];

  @route("/lor/deck/v1/decks/me") @post
  createDeck(): string;

}
