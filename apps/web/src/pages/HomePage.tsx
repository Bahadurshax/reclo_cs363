import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { fetchHealth } from '@/lib/api'

export function HomePage() {
  const healthCheck = useMutation({
    mutationFn: fetchHealth,
    onSuccess: () => toast.success('API and database are reachable'),
    onError: (error) => toast.error(`Health check failed: ${error.message}`),
  })

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Reclo</CardTitle>
          <CardDescription>Outdoor advertising marketplace for Uzbekistan</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Project setup is complete. Use the button to check the API connection.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => healthCheck.mutate()} disabled={healthCheck.isPending}>
            {healthCheck.isPending ? 'Checking…' : 'Check API'}
          </Button>
        </CardFooter>
      </Card>
    </main>
  )
}
