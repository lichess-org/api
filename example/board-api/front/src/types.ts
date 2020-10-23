export interface ServerLogin {
  username: string;
  token: string;
}

export interface Game {
  id: string;
  perf: {
    name: string;
  };
  white: Player;
  black: Player;
  state: {
    status: 'started' | 'finished';
    moves: string;
  }
}

export interface Player {
  id: string;
  name: string;
  rating: number;
  title?: string;
}
