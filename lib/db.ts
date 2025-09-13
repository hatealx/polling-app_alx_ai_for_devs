import { supabase } from './supabase';
import {
  CreatePollData,
  Poll,
  UpdatePollData,
  Vote,
  VoteData,
} from './types/polls';

/**
 * Retrieves the authenticated user's ID.
 * @returns {Promise<string>} The user's ID.
 * @throws {Error} If the user is not authenticated.
 */
async function getUserId() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  return user.id;
}

/**
 * Creates a new poll in the database.
 * It ensures the user is authenticated before creating the poll.
 * The `created_by` field is automatically set to the authenticated user's ID.
 * @param {CreatePollData} data - The data for the new poll.
 * @returns {Promise<Poll>} The newly created poll object.
 * @throws {Error} If the user is not authenticated.
 */
export async function createPoll(data: CreatePollData) {
  const { title, description, options, ends_at } = data;
  const userId = await getUserId();

  const { data: poll, error } = await (supabase as any)
    .from('polls')
    .insert({
      title,
      description,
      options,
      ends_at,
      created_by: userId,
    })
    .select()
    .single();

  if (error) throw error;
  return poll as Poll;
}

/**
 * Updates an existing poll in the database.
 * This function is protected by Row Level Security (RLS) policies in Supabase,
 * ensuring that users can only update polls they created.
 * @param {string} id - The ID of the poll to update.
 * @param {UpdatePollData} data - The new data for the poll.
 * @throws {Error} If the database update fails.
 */
export async function updatePoll(id: string, data: UpdatePollData) {
  const { error } = await (supabase as any)
    .from("polls")
    .update(data)
    .eq("id", id);

  if (error) throw error;
}

/**
 * Fetches a list of all polls from the database.
 * It also retrieves associated votes and calculates aggregates like total votes
 * and vote counts for each option. This pre-calculation simplifies the UI logic.
 * @returns {Promise<Poll[]>} A list of polls with aggregated vote data.
 * @throws {Error} If fetching polls fails.
 */
export async function getPolls() {
  const { data: polls, error } = await (supabase as any)
    .from('polls')
    .select(`*, votes (option_index, user_id)`)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Augment the poll data with vote counts for easier frontend rendering.
  return (polls || []).map((poll: any) => ({
    ...poll,
    total_votes: Array.isArray(poll.votes) ? poll.votes.length : 0,
    options_count: Array.isArray(poll.votes)
      ? poll.votes.reduce((acc: Record<string, number>, vote: Vote) => {
          const key = String(vote.option_index);
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {})
      : {},
  }));
}

/**
 * Fetches a single poll by its ID from the database.
 * This includes all associated votes to provide a complete view of the poll's state.
 * @param {string} id - The ID of the poll to fetch.
 * @returns {Promise<Poll>} The poll object.
 * @throws {Error} If the poll is not found or fetching fails.
 */
export async function getPoll(id: string) {
  const { data: poll, error } = await (supabase as any)
    .from('polls')
    .select(`*, votes (option_index, user_id)`)
    .eq('id', id)
    .single();

  if (error) throw error;
  return poll as Poll;
}

/**
 * Submits a vote for a poll option.
 * It handles both new votes and updates to existing votes. If a user has already
 * voted on a poll, their existing vote is updated to the new option.
 * Otherwise, a new vote is inserted.
 * @param {VoteData} data - The voting data, including poll ID and option index.
 * @throws {Error} If the user is not authenticated or the vote fails.
 */
export async function vote(data: VoteData) {
  const { poll_id, option_index } = data;
  const user_id = await getUserId();

  // Check if the user has already voted on this poll.
  const { data: existingVote } = await supabase
    .from('votes')
    .select()
    .eq('poll_id', poll_id)
    .eq('user_id', user_id)
    .single();

  if (existingVote) {
    // If a vote exists, update it. This allows users to change their vote.
    const { error } = await (supabase as any)
      .from('votes')
      .update({ option_index })
      .eq('poll_id', poll_id)
      .eq('user_id', user_id);

    if (error) throw error;
  } else {
    // If no vote exists, insert a new one.
    const { error } = await (supabase as any)
      .from('votes')
      .insert({
        poll_id,
        option_index,
        user_id,
      });

    if (error) throw error;
  }
}

/**
 * Deletes a poll from the database.
 * This function is protected by Row Level Security (RLS) policies in Supabase,
 * ensuring that users can only delete polls they created.
 * @param {string} id - The ID of the poll to delete.
 * @throws {Error} If the deletion fails.
 */
export async function deletePoll(id: string) {
  const { error } = await (supabase as any)
    .from('polls')
    .delete()
    .eq('id', id);

  if (error) throw error;
}