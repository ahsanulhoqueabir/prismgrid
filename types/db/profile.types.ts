export interface Profile {
  id: string;
  email: string;
  name: string;
  username: string | null;
  password: string;
  role: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
  api_key: string;
}

export type CreateProfile = Omit<
  Profile,
  "id" | "api_key" | "created_at" | "updated_at"
>;

export type ProfileData = Omit<Profile, "password" | "api_key">;
