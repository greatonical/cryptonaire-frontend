import { http } from "@lib/api-client";
import { API } from "@lib/endpoints";

export type Profile = {
  id?: string;
  address?: `0x${string}`;
  name?: string;
  dob?: string;           // YYYY-MM-DD
  job?: string;
  income?: string;
  gender?: "male" | "female" | "other";
};

export type ProfileDTO = Omit<Profile, "id" | "address">;

export async function fetchProfile(): Promise<Profile> {
  // Backend should return the current user's profile at GET /me/profile
  return http.get<Profile>(API.profile.me);
}

export async function updateProfile(patch: ProfileDTO): Promise<Profile> {
  // Adjust to POST/PUT if your API expects that
  return http.patch<Profile>(API.profile.update, patch);
}