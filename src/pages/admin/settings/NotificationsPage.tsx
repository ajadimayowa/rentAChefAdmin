import { Bell } from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card } from '../../../components/ui/Card';
import { SettingsBackLink } from './SettingsBackLink';

export function NotificationsPage() {
  return (
    <div>
      <SettingsBackLink />
      <PageHeader title="Notifications" description="Choose which alerts are sent to admins, chefs and clients." />
      <Card className="flex flex-col items-center px-6 py-16 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-100 text-ink-400">
          <Bell className="h-6 w-6" />
        </span>
        <p className="mt-4 font-heading text-[15px] font-semibold text-ink-900">No notifications settings yet</p>
        <p className="mt-1 max-w-sm text-sm text-ink-500">Notifications settings will be configured here.</p>
      </Card>
    </div>);

}
