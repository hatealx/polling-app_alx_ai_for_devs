'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createPoll } from '@/lib/db';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/auth-context';
import { Plus, Trash2, Save, X, Loader2 } from 'lucide-react';

/**
 * Page component for creating a new poll.
 * It provides a form for users to enter a title, description, and at least two options.
 * The form includes validation and user feedback during submission.
 */
export default function CreatePollPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  // Initialize with two empty strings for the first two options.
  const [options, setOptions] = useState(['', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Protect the route by redirecting unauthenticated users to the login page.
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

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
   * Handles the form submission for creating a new poll.
   * It performs validation, calls the database function, and handles success or error states.
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

    // Filter out empty option fields before validation and submission.
    const validOptions = options.filter(opt => opt.trim());
    if (validOptions.length < 2) {
      setError('At least two options are required');
      return;
    }

    try {
      setIsSubmitting(true);
      await createPoll({
        title: title.trim(),
        description: description.trim() || undefined,
        options: validOptions
      });
      // On success, redirect to the main polls page to see the new poll.
      router.push('/polls');
      router.refresh();
    } catch (err) {
      setError('Failed to create poll. Please try again.');
      console.error('Error creating poll:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Create New Poll</CardTitle>
            <CardDescription>
              Set up a new poll with your questions and options
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
                    <div key={index} className="flex items-center gap-2">
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
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOption(index)}
                          disabled={isSubmitting}
                          className="text-muted-foreground"
                        >
                          <Trash2 className="h-4 w-4" />
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
                  <Plus className="mr-2 h-4 w-4" />
                  Add Option
                </Button>
              </div>

              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}

              <div className="flex gap-4">
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Create Poll
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  <X className="mr-2 h-4 w-4" />
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