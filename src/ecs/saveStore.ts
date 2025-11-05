import Dexie from "dexie";

interface GameSave {
  id: string;
  data: any;
  timestamp: number;
}

class GameDatabase extends Dexie {
  saves!: Dexie.Table<GameSave, string>;

  constructor() {
    super("GameSaveDB");
    this.version(1).stores({
      saves: "id",
    });
  }
}

const db = new GameDatabase();

export async function saveGameData(data: any) {
  const save = { id: "main", data, timestamp: Date.now() };
  await db.saves.put(save);
}

export async function loadGameData(): Promise<any | null> {
  const save = await db.saves.get("main");
  return save?.data ?? null;
}

export async function clearGameData() {
  await db.saves.clear();
}
