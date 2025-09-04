import { User } from '@supabase/supabase-js';

export interface Poll {
  id: string;
  title: string;
  description?: string;
  options: string[];
  created_at: string;
  created_by: string;
  ends_at?: string;
  creator?: User;
  total_votes?: number;
  user_vote?: number;
  /** Map of option index -> vote count (keys are strings because JSON object keys are strings) */
  options_count?: Record<string, number>;
}

export interface Vote {
  id: string;
  poll_id: string;
  user_id: string;
  option_index: number;
  created_at: string;
}

export interface CreatePollData {
  title: string;
  description?: string;
  options: string[];
  ends_at?: string;
}

export interface UpdatePollData {
  title: string;
  description?: string;
  options: string[];
  ends_at?: string;
}

export interface VoteData {
  poll_id: string;
  option_index: number;
}