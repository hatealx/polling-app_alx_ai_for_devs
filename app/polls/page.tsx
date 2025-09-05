'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPolls, vote, deletePoll } from '@/lib/db';
import { Poll } from '@/lib/types/polls';
import { useAuth } from '@/lib/auth-context';
import { PlusCircle, Trash2, Edit, Vote as VoteIcon } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

/**
 * The main polls page, which serves as the user dashboard.
 * It displays a list of all polls, allows users to vote, and provides
 * navigation for creating, editing, and deleting polls.
 */
export default function PollsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [polls, setPolls] = useState<Poll[]>([]);
  // State to track the selected radio button option for each poll.
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Redirect to login if user is not authenticated.
    if (!authLoading && !user) {
      router.push('/auth/login');
    } else if (user) {
      loadPolls();
    }
  }, [user, authLoading, router]);

  /**
   * Fetches all polls from the database and updates the component's state.
   */
  const loadPolls = async () => {
    try {
      setLoading(true);
      const fetchedPolls = await getPolls();
      setPolls(fetchedPolls);
    } catch (err) {
      setError('Failed to load polls');
      console.error('Error loading polls:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles the vote submission for a specific poll.
   * It reads the selected option from the state and calls the database function.
   * @param {string} pollId - The ID of the poll being voted on.
   */
  const handleVote = async (pollId: string) => {
    const optionIndex = selectedOptions[pollId];
    if (optionIndex === undefined) return;

    try {
      await vote({ poll_id: pollId, option_index: parseInt(optionIndex, 10) });
      await loadPolls(); // Refresh polls after voting
    } catch (err) {
      console.error('Error voting:', err);
    }
  };

  /**
   * Handles the deletion of a poll.
   * Prompts the user for confirmation before proceeding.
   * @param {string} pollId - The ID of the poll to delete.
   */
  const handleDelete = async (pollId: string) => {
    if (!confirm('Are you sure you want to delete this poll?')) return;
    
    try {
      await deletePoll(pollId);
      await loadPolls(); // Refresh polls after deletion
    } catch (err) {
      console.error('Error deleting poll:', err);
    }
  };

  // Render a loading state while authentication or data fetching is in progress.
  if (authLoading || loading) {
    return <div className="text-center py-8">Loading polls...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight">Polls</h1>
        <Link href="/polls/create">
          <Button size="lg">
            <PlusCircle className="mr-2 h-5 w-5" />
            Create New Poll
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {polls.map((poll) => {
          // Check if the current user has already voted on this poll.
          const userVote = poll.votes?.find(v => v.user_id === user?.id)?.option_index;

          return (
            <Card key={poll.id} className="hover:shadow-lg transition-shadow duration-200 flex flex-col">
              <CardHeader className="space-y-1">
                <Link href={`/polls/${poll.id}`} className="hover:underline">
                  <CardTitle className="text-xl">{poll.title}</CardTitle>
                </Link>
                {poll.description && (
                  <CardDescription className="text-sm">{poll.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                {userVote !== undefined ? (
                  // If user has voted, display the results view.
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
                            {/* Highlight the user's chosen option. */}
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
                  <form onSubmit={(e) => { e.preventDefault(); handleVote(poll.id); }}>
                    <RadioGroup
                      value={selectedOptions[poll.id]}
                      onValueChange={(value) => setSelectedOptions(prev => ({ ...prev, [poll.id]: value }))}
                      className="space-y-2 mb-4"
                    >
                      {poll.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <RadioGroupItem value={String(index)} id={`${poll.id}-option-${index}`} />
                          <Label htmlFor={`${poll.id}-option-${index}`}>{option}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={!user || selectedOptions[poll.id] === undefined}
                    >
                      <VoteIcon className="mr-2 h-4 w-4" />
                      Submit Vote
                    </Button>
                  </form>
                )}
              </CardContent>
              {/* Show edit/delete buttons only to the poll's creator. */}
              {user && poll.created_by === user.id && (
                <div className="p-6 pt-0 flex gap-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push(`/polls/${poll.id}/edit`)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => handleDelete(poll.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              )}
            </Card>
          )
        })}

        {polls.length === 0 && (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No polls available. Create one to get started!
          </div>
        )}
      </div>
    </div>
  );
}