import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/** "← Settings" link shown above each settings sub-page. */
export function SettingsBackLink() {
  return (
    <Link
      to="/admin/settings"
      className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900">

      <ArrowLeft className="h-4 w-4" /> Settings
    </Link>);

}
