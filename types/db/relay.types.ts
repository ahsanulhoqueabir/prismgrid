/** Represents a row in the `relay_commands` table */
export interface RelayCommand {
  id: string;
  profile: string; // FK → profile.id
  state: boolean; // true = ON, false = OFF
  status: "pending" | "executed";
  created_at: string;
  executed_at: string | null;
}

/** Payload for creating/upserting a relay command */
export interface CreateRelayCommandPayload {
  profile: string;
  state: boolean;
}
