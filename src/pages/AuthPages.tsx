import { Card } from '../components/ui/Card';

export function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cloud p-6">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-heading-sm font-medium text-ink">Sign in</h1>
        <p className="mt-2 text-body-sm text-slate">Login form arrives in Phase 2.</p>
      </Card>
    </div>
  );
}

export function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cloud p-6">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-heading-sm font-medium text-ink">Create account</h1>
        <p className="mt-2 text-body-sm text-slate">Register form arrives in Phase 2.</p>
      </Card>
    </div>
  );
}
