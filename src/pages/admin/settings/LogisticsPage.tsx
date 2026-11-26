import { Truck } from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card } from '../../../components/ui/Card';
import { SettingsBackLink } from './SettingsBackLink';

export function LogisticsPage() {
  return (
    <div>
      <SettingsBackLink />
      <PageHeader title="Logistics" description="Delivery, transport and travel settings for chefs and orders." />
      <Card className="flex flex-col items-center px-6 py-16 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-100 text-ink-400">
          <Truck className="h-6 w-6" />
        </span>
        <p className="mt-4 font-heading text-[15px] font-semibold text-ink-900">No logistics settings yet</p>
        <p className="mt-1 max-w-sm text-sm text-ink-500">Logistics settings will be configured here.</p>
      </Card>
    </div>);

}
