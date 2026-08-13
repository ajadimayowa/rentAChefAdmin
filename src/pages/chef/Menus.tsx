import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Plus, Star } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Toolbar, FilterSelect } from '../../components/ui/Toolbar';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { AddMenuModal } from '../../components/chef/AddMenuModal';
import { useAuthStore } from '../../store/authStore';
import { convertToThousand, formatDate, titleCase } from '../../utils/format';
import { ApiError } from '../../config/api';
import { listChefMenus, type ChefMenu, type ChefMenuType } from '../../services/chef/menuServices';

const errorMessage = (err: unknown, fallback: string): string =>
err instanceof ApiError ? err.message : fallback;

export function ChefMenus() {
  const authUser = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const [menus, setMenus] = useState<ChefMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [menuTypeFilter, setMenuTypeFilter] = useState('all');
  const [addMenuOpen, setAddMenuOpen] = useState(false);

  const loadMenus = () => {
    if (!authUser) return;
    setLoading(true);
    listChefMenus({
      chefId: authUser.id,
      search,
      menuType: menuTypeFilter as ChefMenuType | 'all',
      limit: 100
    }).
    then((res) => setMenus(res.data)).
    catch((err) => toast.error(errorMessage(err, 'Could not load your menus.'))).
    finally(() => setLoading(false));
  };

  useEffect(() => {
    const timeout = setTimeout(loadMenus, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser?.id, search, menuTypeFilter]);

  const columns: Column<ChefMenu>[] = [
  {
    key: 'menu',
    header: 'Menu',
    render: (m) =>
    <div className="flex items-center gap-3">
          {m.samplePicture &&
      <img src={m.samplePicture} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
      }
          <div>
            <p className="font-medium text-ink-950">{m.title}</p>
            <p className="max-w-sm truncate text-xs text-ink-500">{m.description}</p>
          </div>
        </div>

  },
  {
    key: 'type',
    header: 'Menu type',
    render: (m) =>
    <div className="space-y-1">
          <Badge tone="neutral">{titleCase(m.menuType)}</Badge>
          {m.menuClass && <p className="text-xs text-ink-500">{titleCase(m.menuClass)}</p>}
        </div>

  },
  {
    key: 'perHead',
    header: 'Price / head',
    align: 'right',
    render: (m) => <span className="font-medium">{convertToThousand(m.pricePerHead)}</span>
  },
  {
    key: 'grocery',
    header: 'Grocery cost',
    align: 'right',
    render: (m) => convertToThousand(m.totalGroceryCost)
  },
  {
    key: 'signature',
    header: 'Signature',
    align: 'center',
    render: (m) =>
    m.isSignatureMenu ?
    <Badge tone="brand">
          <Star className="mr-1 inline h-3 w-3" /> Yes
        </Badge> :

    <span className="text-xs text-ink-400">—</span>

  },
  {
    key: 'created',
    header: 'Created',
    render: (m) => formatDate(m.createdAt)
  }];


  return (
    <div>
      <PageHeader
        title="My Menus"
        description="Manage the menus guests see when they browse your profile."
        action={
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setAddMenuOpen(true)}>
            Add menu
          </Button>
        } />


      <Card>
        <CardHeader
          title="Menu library"
          description={`${menus.length} menu${menus.length === 1 ? '' : 's'} on record`} />

        <Toolbar search={search} onSearch={setSearch} placeholder="Search your menus…">
          <FilterSelect
            label="Menu type filter"
            value={menuTypeFilter}
            onChange={setMenuTypeFilter}
            options={[
            { value: 'all', label: 'All menu types' },
            { value: 'breakfast', label: 'Breakfast' },
            { value: 'lunch', label: 'Lunch' },
            { value: 'dinner', label: 'Dinner' }]
            } />

        </Toolbar>
        <DataTable
          columns={columns}
          rows={menus}
          rowKey={(m) => m.id}
          onRowClick={(m) => navigate(`/chef/menus/${m.id}`)}
          emptyTitle={loading ? 'Loading menus…' : 'No menus found'}
          emptyDescription={loading ? 'Fetching your menu library.' : 'Create a menu to start showing up in guest bookings.'} />

      </Card>

      {authUser ?
      <AddMenuModal
        open={addMenuOpen}
        chefId={authUser.id}
        onClose={() => setAddMenuOpen(false)}
        onCreated={() => {
          setAddMenuOpen(false);
          loadMenus();
        }} /> :

      null}
    </div>);

}
