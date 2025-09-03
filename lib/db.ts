import { supabase } from './supabase';
import { CreatePollData, Poll, Vote, VoteData } from './types/polls';

export async function createPoll(data: CreatePollData) {
  const { title, description, options, ends_at } = data;

  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error('Not authenticated');

  const { data: poll, error } = await (supabase as any)
    .from('polls')
    .insert({
      title,
      description,
      options,
      ends_at,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return poll as Poll;
}

export async function getPolls() {
  const { data: polls, error } = await (supabase as any)
    .from('polls')
    .select(`*, votes (option_index, user_id)`)
    .order('created_at', { ascending: false });

  if (error) throw error;

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

export async function getPoll(id: string) {
  const { data: poll, error } = await (supabase as any)
    .from('polls')
    .select(`*, votes (option_index, user_id)`)
    .eq('id', id)
    .single();

  if (error) throw error;
  return poll as Poll;
}

export async function vote(data: VoteData) {
  const { poll_id, option_index } = data;
  const user = (await supabase.auth.getUser()).data.user;
  const user_id = user?.id;

  if (!user_id) throw new Error('Not authenticated');

  const { data: existingVote } = await supabase
    .from('votes')
    .select()
    .eq('poll_id', poll_id)
    .eq('user_id', user_id)
    .single();

  if (existingVote) {
    const { error } = await (supabase as any)
      .from('votes')
      .update({ option_index })
      .eq('poll_id', poll_id)
      .eq('user_id', user_id);

    if (error) throw error;
  } else {
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

export async function deletePoll(id: string) {
  const { error } = await (supabase as any)
    .from('polls')
    .delete()
    .eq('id', id);

  if (error) throw error;
}