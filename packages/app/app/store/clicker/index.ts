import { ClickerGame } from "#shared/models/clicker/data/ClickerGame";
import { authClient } from "@/services/auth/authClient";
import { CLICKER_LOCAL_STORAGE_KEY } from "@/services/clicker/constants";
import { saveItemMetadata } from "@/services/shared/metadata/saveItemMetadata";

export const useClickerStore = defineStore("clicker", () => {
  const session = authClient.useSession();
  const { $trpc } = useNuxtApp();
  const game = ref(new ClickerGame());
  const saveGame = async () => {
    if (session.value.data) {
      saveItemMetadata(game.value);
      await $trpc.clicker.saveGame.mutate(game.value);
    } else {
      saveItemMetadata(game.value);
      localStorage.setItem(CLICKER_LOCAL_STORAGE_KEY, game.value.toJSON());
    }
  };
  return { game, saveGame };
});
