export interface User {
  id: string;
  name: string | null;
  username: string;
  image: string | null;
  _count: {
    followers: number;
    following: number;
  };
}
