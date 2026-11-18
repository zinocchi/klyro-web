import { Card } from '../components/ui/Card';

export function MoneyPage() {
  return (
    <Card className="p-6 sm:p-8">
      <h1 className="break-words text-heading-sm font-medium text-ink">Money</h1>
      <p className="mt-2 text-body-sm text-slate">
        Transaction workspace arrives in Phase 4.
      </p>
    </Card>
  );
}

export function NotesPage() {
  return (
    <Card className="p-6 sm:p-8">
      <h1 className="break-words text-heading-sm font-medium text-ink">Notes</h1>
      <p className="mt-2 text-body-sm text-slate">Quick notes arrive in Phase 4.</p>
    </Card>
  );
}
