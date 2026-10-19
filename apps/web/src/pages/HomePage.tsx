import { useMutation } from '@tanstack/react-query'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { useAuth } from '@/auth/useAuth'
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

// All user-visible strings for this page, in one place for the future translation task.
const copy = {
  title: 'Reclo',
  description: 'Outdoor advertising marketplace for Uzbekistan',
  body: 'Project setup is complete. Use the button to check the API connection.',
  checkApi: 'Check API',
  checking: 'Checking…',
  apiOk: 'API and database are reachable',
  apiFailed: 'Health check failed:',
  signedInAs: 'Signed in as',
  signOut: 'Sign out',
  signingOut: 'Signing out…',
  signOutFailed: 'Could not sign out. Please try again.',
  signIn: 'Sign in',
  signUp: 'Sign up',
}

export function HomePage() {
  const { user, isLoading, signOut } = useAuth()

  const healthCheck = useMutation({
    mutationFn: fetchHealth,
    onSuccess: () => toast.success(copy.apiOk),
    onError: (error) => toast.error(`${copy.apiFailed} ${error.message}`),
  })
  const signOutMutation = useMutation({
    mutationFn: signOut,
    onError: () => toast.error(copy.signOutFailed),
  })

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{copy.title}</CardTitle>
          <CardDescription>{copy.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">{copy.body}</p>
          {user && (
            <p className="text-sm">
              {copy.signedInAs} <span className="font-medium">{user.email}</span>
            </p>
          )}
        </CardContent>
        <CardFooter className="gap-2">
          <Button onClick={() => healthCheck.mutate()} disabled={healthCheck.isPending}>
            {healthCheck.isPending ? copy.checking : copy.checkApi}
          </Button>
          {user ? (
            <Button
              variant="outline"
              onClick={() => signOutMutation.mutate()}
              disabled={signOutMutation.isPending}
            >
              {signOutMutation.isPending ? copy.signingOut : copy.signOut}
            </Button>
          ) : (
            !isLoading && (
              <>
                <Button variant="outline" asChild>
                  <Link to="/sign-in">{copy.signIn}</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link to="/sign-up">{copy.signUp}</Link>
                </Button>
              </>
            )
          )}
        </CardFooter>
      </Card>
    </main>
  )
}
