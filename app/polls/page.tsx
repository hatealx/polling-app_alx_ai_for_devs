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

export default function PollsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    } else if (user) {
      loadPolls();
    }
  }, [user, authLoading, router]);

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

  const handleVote = async (pollId: string, optionIndex: number) => {
    try {
      await vote({ poll_id: pollId, option_index: optionIndex });
      await loadPolls(); // Refresh polls after voting
    } catch (err) {
      console.error('Error voting:', err);
    }
  };

  const handleDelete = async (pollId: string) => {
    if (!confirm('Are you sure you want to delete this poll?')) return;
    
    try {
      await deletePoll(pollId);
      await loadPolls(); // Refresh polls after deletion
    } catch (err) {
      console.error('Error deleting poll:', err);
    }
  };

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
        {polls.map((poll) => (
          <Card key={poll.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl">{poll.title}</CardTitle>
              {poll.description && (
                <CardDescription className="text-sm">{poll.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {poll.options.map((option, index) => {
                  const voteCount = poll.options_count?.[String(index)] ?? 0;
                  const percentage = poll.total_votes
                    ? Math.round((voteCount / poll.total_votes) * 100)
                    : 0;

                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{option}</span>
                        <span className="text-muted-foreground">{percentage}% ({voteCount} votes)</span>
                      </div>
                      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 bg-primary transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleVote(poll.id, index)}
                        disabled={!user}
                      >
                        <VoteIcon className="mr-2 h-4 w-4" />
                        Vote
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
            {user && poll.created_by === user.id && (
              <div className="px-6 pb-6 flex gap-2">
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
        ))}

        {polls.length === 0 && (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No polls available. Create one to get started!
          </div>
        )}
      </div>
    </div>
  );
}