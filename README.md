# ALX Polly - A Real-Time Polling Application

ALX Polly is a modern, full-stack polling application that allows users to create, share, and vote on polls in real-time. It features a clean and intuitive user interface, secure authentication, and a robust backend powered by Supabase.

## Features

- **User Authentication**: Secure sign-up and sign-in functionality using Supabase Auth.
- **Poll Management**: Authenticated users can create, edit, and delete their own polls.
- **Real-Time Voting**: Users can vote on polls, and results are updated instantly.
- **Dynamic UI**: A responsive and interactive interface built with Next.js and shadcn/ui.
- **Protected Routes**: Core application features are protected, requiring users to be logged in.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Library**: [React](https://react.dev/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: [Supabase](https://supabase.io/) (PostgreSQL)
- **Authentication**: [Supabase Auth](https://supabase.io/docs/guides/auth)
- **Icons**: [Lucide React](https://lucide.dev/guide/packages/lucide-react)

## Project Structure

```
.
├── app/                  # Next.js App Router routes
│   ├── (auth)/           # Authentication-related pages (login, register)
│   ├── polls/            # Poll management pages (list, create, edit, view)
│   └── layout.tsx        # Root layout
├── components/           # Reusable React components (UI elements from shadcn)
├── lib/                  # Core logic and utilities
│   ├── auth-context.tsx  # React context for authentication
│   ├── db.ts             # Database interaction functions
│   └── supabase.ts       # Supabase client initialization
├── supabase/             # Supabase-specific files
│   └── migrations/       # Database schema migrations
└── README.md             # This file
```

## Getting Started

Follow these steps to set up and run the project locally.

### 1. Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or later)
- [npm](https://www.npmjs.com/) or another package manager

### 2. Clone the Repository

```bash
git clone <repository-url>
cd polling-app
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Set Up Supabase

This project requires a Supabase project for its database and authentication services.

1.  **Create a Supabase Project**: Go to [app.supabase.com](https://app.supabase.com) and create a new project.
2.  **Get API Credentials**:
    - In your Supabase project dashboard, navigate to **Settings** > **API**.
    - Find your **Project URL** and your `anon` **public** key.
3.  **Create Environment File**:
    - Duplicate the `.env.local.example` file and rename it to `.env.local`.
    - Add your Supabase credentials to the `.env.local` file:
      ```env
      NEXT_PUBLIC_SUPABASE_URL=YOUR_PROJECT_URL
      NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_PUBLIC_KEY
      ```
4.  **Set Up Database Schema**:
    - In your Supabase project dashboard, navigate to the **SQL Editor**.
    - Open the `supabase/migrations/20240101000000_create_polls_schema.sql` file from this repository.
    - Copy the entire SQL content, paste it into the Supabase SQL Editor, and click **Run**. This will create the `polls` and `votes` tables and set up the necessary security policies.

### 5. Run the Application Locally

Once the setup is complete, you can start the development server:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Usage

- **Register and Log In**: Create a new account or log in with an existing one.
- **Create a Poll**: Click the "Create New Poll" button, fill in the details, and submit.
- **Vote on a Poll**: On the main page or the poll detail page, select an option and click "Submit Vote."
- **View Results**: After voting, the poll will display the current results with percentages.
- **Manage Your Polls**: If you created a poll, you will see "Edit" and "Delete" buttons on it, allowing you to manage your content.
