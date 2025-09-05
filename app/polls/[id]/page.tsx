'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPoll, vote } from '@/lib/db';
import { Poll } from '@/lib/types/polls';
import { useAuth } from '@/lib/auth-context';
import { ArrowLeft, Vote as VoteIcon } from 'lucide-react';
import Link from 'next/link';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

/**
 * A detailed view page for a single poll.
 * It displays the poll's title, description, and options, and allows authenticated
 * users to cast their vote. After voting, it shows the results.
 */
export default function PollDetailPage() {
  const router = useRouter();
  const params = useParams();
  const pollId = params.id as string;

  const { user, loading: authLoading } = useAuth();
  const [poll, setPoll] = useState<Poll | null>(null);
  // State to manage the selected radio button for the vote.
  const [selectedOption, setSelectedOption] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /**
   * Fetches the specific poll data from the database.
   */
  const loadPoll = async () => {
    try {
      setLoading(true);
      const fetchedPoll = await getPoll(pollId);
      setPoll(fetchedPoll);
    } catch (err) {
      setError('Failed to load poll');
      console.error('Error loading poll:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    } else if (pollId) {
      loadPoll();
    }
  }, [pollId, user, authLoading, router]);

  /**
   * Handles the submission of a vote.
   * It takes the currently selected option and calls the database `vote` function.
   */
  const handleVote = async () => {
    if (selectedOption === undefined) return;
    try {
      await vote({ poll_id: pollId, option_index: parseInt(selectedOption, 10) });
      await loadPoll(); // Refresh poll data after voting to show updated results.
    } catch (err) {
      console.error('Error voting:', err);
    }
  };

  if (authLoading || loading) {
    return <div className="text-center py-8">Loading poll...</div>;
  }

  if (error || !poll) {
    return <div className="text-center py-8 text-red-500">{error || 'Poll not found.'}</div>;
  }

  // Determine if the current user has already cast a vote on this poll.
  const userVote = poll.votes?.find(v => v.user_id === user?.id)?.option_index;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Link href="/polls" className="inline-flex items-center gap-2 text-sm mb-4 hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Back to polls
      </Link>
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{poll.title}</CardTitle>
          {poll.description && (
            <CardDescription className="pt-2">{poll.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {userVote !== undefined ? (
            // If user has voted, display the results.
            <div className="space-y-4">
              <p className="text-sm font-semibold text-center text-green-600">Thanks for voting!</p>
              {poll.options.map((option, index) => {
                const voteCount = poll.options_count?.[String(index)] ?? 0;
                const percentage = poll.total_votes
                  ? Math.round((voteCount / poll.total_votes) * 100)
                  : 0;

                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      {/* Highlight the option the user voted for. */}
                      <span className={`font-medium ${userVote === index ? 'text-primary' : ''}`}>{option}</span>
                      <span className="text-muted-foreground">{percentage}% ({voteCount} votes)</span>
                    </div>
                    <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-primary transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // If user has not voted, display the voting form.
            <form onSubmit={(e) => { e.preventDefault(); handleVote(); }}>
              <RadioGroup
                value={selectedOption}
                onValueChange={setSelectedOption}
                className="space-y-2 mb-4"
              >
                {poll.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={String(index)} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
              <Button
                type="submit"
                className="w-full"
                disabled={!user || selectedOption === undefined}
              >
                <VoteIcon className="mr-2 h-4 w-4" />
                Submit Vote
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
