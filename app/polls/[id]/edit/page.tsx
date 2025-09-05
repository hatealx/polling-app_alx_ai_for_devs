'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPoll, updatePoll } from '@/lib/db';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/auth-context';
import { Poll } from '@/lib/types/polls';

/**
 * Page component for editing an existing poll.
 * It fetches the current poll data, populates a form with it, and handles
 * the submission of updated poll details. It also ensures that only the
 * creator of the poll can access this page.
 */
export default function EditPollPage() {
  const router = useRouter();
  const params = useParams();
  const pollId = params.id as string;
  
  const { user, loading: authLoading } = useAuth();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Redirect unauthenticated users.
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    // Fetch the poll data when the component mounts or pollId changes.
    if (pollId && user) { // Ensure user is available to check ownership
      getPoll(pollId)
        .then(data => {
          // --- Authorization Check ---
          // Verify that the logged-in user is the creator of the poll.
          // This is a crucial client-side check to prevent unauthorized edits.
          if (data.created_by !== user?.id) {
            router.push('/polls'); // Redirect if not the owner.
            return;
          }
          setPoll(data);
          // Populate form fields with the existing poll data.
          setTitle(data.title);
          setDescription(data.description || '');
          setOptions(data.options);
          setLoading(false);
        })
        .catch(() => {
          setError('Failed to load poll data.');
          setLoading(false);
        });
    }
  }, [pollId, user, router]);

  /**
   * Adds a new, empty option field to the form.
   */
  const addOption = () => {
    setOptions([...options, '']);
  };

  /**
   * Removes an option field from the form.
   * Ensures that a minimum of two options is always maintained.
   * @param {number} index - The index of the option to remove.
   */
  const removeOption = (index: number) => {
    if (options.length <= 2) return;
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };

  /**
   * Handles the form submission to update the poll.
   * It performs validation and calls the database update function.
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // --- Form Validation ---
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    const validOptions = options.filter(opt => opt.trim());
    if (validOptions.length < 2) {
      setError('At least two options are required');
      return;
    }

    try {
      setIsSubmitting(true);
      await updatePoll(pollId, {
        title: title.trim(),
        description: description.trim() || undefined,
        options: validOptions
      });
      router.push('/polls');
      router.refresh();
    } catch (err) {
      setError('Failed to update poll. Please try again.');
      console.error('Error updating poll:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Edit Poll</CardTitle>
            <CardDescription>
              Update the details of your poll
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">
                  Poll Title
                </label>
                <Input
                  id="title"
                  placeholder="Enter poll title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                  Description (Optional)
                </label>
                <Textarea
                  id="description"
                  placeholder="Enter poll description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Options
                </label>
                <div className="space-y-2">
                  {options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...options];
                          newOptions[index] = e.target.value;
                          setOptions(newOptions);
                        }}
                        disabled={isSubmitting}
                      />
                      {options.length > 2 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => removeOption(index)}
                          disabled={isSubmitting}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-2"
                  onClick={addOption}
                  disabled={isSubmitting}
                >
                  Add Option
                </Button>
              </div>

              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}

              <div className="flex gap-4">
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? 'Updating...' : 'Update Poll'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
