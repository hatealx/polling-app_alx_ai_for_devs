import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function CreatePollPage() {
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
            <form className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">
                  Poll Title
                </label>
                <Input id="title" placeholder="Enter poll title" />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                  Description (Optional)
                </label>
                <Input id="description" placeholder="Enter poll description" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Options
                </label>
                <div className="space-y-2">
                  <Input placeholder="Option 1" />
                  <Input placeholder="Option 2" />
                  <Input placeholder="Option 3" />
                  <Input placeholder="Option 4" />
                </div>
                <Button type="button" variant="outline" className="mt-2">
                  Add Option
                </Button>
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1">
                  Create Poll
                </Button>
                <Button type="button" variant="outline" className="flex-1">
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