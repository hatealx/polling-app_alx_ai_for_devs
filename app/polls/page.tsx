import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

// Placeholder data
const polls = [
  {
    id: 1,
    title: "What's your favorite programming language?",
    description: "Vote for your preferred language",
    options: ["JavaScript", "Python", "Java", "C++"],
    votes: [45, 32, 28, 15]
  },
  {
    id: 2,
    title: "Best time for team meetings?",
    description: "When should we schedule our weekly meetings?",
    options: ["9 AM", "2 PM", "4 PM", "6 PM"],
    votes: [20, 35, 25, 10]
  }
]

export default function PollsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Polls</h1>
        <Link href="/polls/create">
          <Button>Create New Poll</Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {polls.map((poll) => (
          <Card key={poll.id}>
            <CardHeader>
              <CardTitle>{poll.title}</CardTitle>
              <CardDescription>{poll.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {poll.options.map((option, index) => (
                  <div key={index} className="flex justify-between items-center p-2 border rounded">
                    <span>{option}</span>
                    <span className="text-sm text-muted-foreground">{poll.votes[index]} votes</span>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4" variant="outline">
                Vote
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}