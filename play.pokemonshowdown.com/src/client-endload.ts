import { PS } from "./client-main";
import { Dex } from "./battle-dex";

PS.libsLoaded.loaded();
void Dex.loadTextData().then(() => PS.updateTranslatedText());
