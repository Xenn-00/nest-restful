export type AuthResponse = {
  id: string;
  username: string;
  tokens?: string;
  refresh?: string;
};

export type AuthSignInResponse = {
  id: string;
  username: string;
  token: string;
};
export type AuthRefreshResponse = {
  id: string;
  username: string;
  token: string;
};

export type SignUpRequest = {
  username: string;
  password: string;
  name: string;
};

export type SignInRequest = {
  username: string;
  password: string;
};
