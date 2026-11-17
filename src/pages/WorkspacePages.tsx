import { Card } from '../components/ui/Card';

export function DashboardPage() {
  return (
    <Card className="p-8">
      <h1 className="text-heading-sm font-medium text-ink">Dashboard</h1>
      <p className="mt-2 text-body-sm text-slate">Daily dashboard arrives in Phase 4.</p>
    </Card>
  );
}

export function HabitsPage() {
  return (
    <Card className="p-8">
      <h1 className="text-heading-sm font-medium text-ink">Habits</h1>
      <p className="mt-2 text-body-sm text-slate">Habits tracker arrives in Phase 4.</p>
    </Card>
  );
}
