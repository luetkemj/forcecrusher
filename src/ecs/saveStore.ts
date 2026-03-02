import Dexie from "dexie";

interface GameSave {
  id: string;
  data: any;
  timestamp: number;
}

export interface LeaderboardEntry {
  score: number;
  cod: string;
  turn: number;
  date: string;
  victory: boolean;
}

class GameDatabase extends Dexie {
  saves!: Dexie.Table<GameSave, string>;
  leaderboard!: Dexie.Table<GameSave, string>;

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

export async function saveLeaderboard(data: any) {
  const save = { id: "leaderboard", data, timestamp: Date.now() };
  await db.saves.put(save);
}

export async function loadLeaderboard(): Promise<any | null> {
  const save = await db.saves.get("leaderboard");
  return save?.data ?? null;
}
