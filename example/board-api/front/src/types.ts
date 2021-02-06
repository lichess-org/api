export interface ServerLogin {
  username: string;
  token: string;
}

export interface GameState {
  status: 'started' | 'finished';
  moves: string;
}

export interface GameFull {
  id: string;
  perf: {
    name: string;
  };
  white: Player;
  black: Player;
  state: GameState;
}

export interface Player {
  id: string;
  name: string;
  rating: number;
  title?: string;
}
