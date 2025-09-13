import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreatePollPage from '../page';
import { useAuth } from '@/lib/auth-context';
import { createPoll } from '@/lib/db';
import { useRouter } from 'next/navigation';

jest.mock('@/lib/auth-context');
jest.mock('@/lib/db');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
  }),
}));

describe('CreatePollPage', () => {
  const mockUseAuth = useAuth as jest.Mock;
  const mockCreatePoll = createPoll as jest.Mock;
  const mockUseRouter = useRouter as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a poll and redirect on successful submission', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: '123', email: 'test@example.com' },
      loading: false,
    });
    const router = mockUseRouter();
    
    render(<CreatePollPage />);

    fireEvent.change(screen.getByPlaceholderText('Enter poll title'), {
      target: { value: 'Test Poll' },
    });
    fireEvent.change(screen.getByPlaceholderText('Option 1'), {
      target: { value: 'Option A' },
    });
    fireEvent.change(screen.getByPlaceholderText('Option 2'), {
      target: { value: 'Option B' },
    });

    fireEvent.click(screen.getByText('Create Poll'));

    await waitFor(() => {
      expect(mockCreatePoll).toHaveBeenCalledWith({
        title: 'Test Poll',
        description: undefined,
        options: ['Option A', 'Option B'],
      });
    });

    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith('/polls');
    });
  });
});
