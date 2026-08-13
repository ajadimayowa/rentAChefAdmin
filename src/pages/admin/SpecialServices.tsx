import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { Plus, Users, UtensilsCrossed } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader } from '../../components/ui/Card';
import { Toolbar } from '../../components/ui/Toolbar';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { Modal, ModalFooter } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { RowActions } from '../../components/ui/RowActions';
import { ImageField, NumberField, TextAreaField, TextField } from '../../components/form/Fields';
import {
  createSpecialMenu,
  deleteSpecialMenu,
  listSpecialMenus,
  updateSpecialMenu,
  type AdminSpecialMenu,
  type SpecialMenuInput } from
'../../services/admin/specialMenuServices';
import { convertToThousand, formatDate } from '../../utils/format';
import { ApiError } from '../../config/api';

const errorMessage = (err: unknown, fallback: string): string =>
err instanceof ApiError ? err.message : fallback;

const schema = Yup.object({
  title: Yup.string().required('Title is required'),
  description: Yup.string(),
  minimumGuests: Yup.number().typeError('Enter a number').required('Minimum guests is required').min(1),
  numberOfDishes: Yup.number().typeError('Enter a number').required('Number of dishes is required').min(1),
  price: Yup.number().typeError('Enter a number').required('Price is required').min(0)
});

interface SpecialMenuFormValues {
  id?: string;
  title: string;
  description: string;
  minimumGuests: number | '';
  numberOfDishes: number | '';
  price: number | '';
  menuPic: File | null;
  image?: string;
}

const emptySpecialMenu: SpecialMenuFormValues = {
  title: '',
  description: '',
  minimumGuests: '',
  numberOfDishes: '',
  price: '',
  menuPic: null
};

export function SpecialServices() {
  const navigate = useNavigate();
  const [menus, setMenus] = useState<AdminSpecialMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<SpecialMenuFormValues | null>(null);
  const [deleting, setDeleting] = useState<AdminSpecialMenu | null>(null);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => {
      listSpecialMenus({ search, limit: 100 }).
      then((res) => setMenus(res.data)).
      catch((err) => toast.error(errorMessage(err, 'Could not load special services.'))).
      finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const upsert = (menu: AdminSpecialMenu) => {
    setMenus((prev) => {
      const exists = prev.some((m) => m.id === menu.id);
      return exists ? prev.map((m) => m.id === menu.id ? menu : m) : [menu, ...prev];
    });
  };

  const handleDelete = async (menu: AdminSpecialMenu) => {
    try {
      await deleteSpecialMenu(menu.id);
      setMenus((prev) => prev.filter((m) => m.id !== menu.id));
      toast.success(`${menu.title} deleted.`);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not delete this special service.'));
    }
  };

  const columns: Column<AdminSpecialMenu>[] = [
  {
    key: 'menu',
    header: 'Special service',
    render: (m) =>
    <div className="flex items-center gap-3">
          {m.image ?
      <img src={m.image} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" /> :

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-400">
              <UtensilsCrossed className="h-4 w-4" />
            </div>
      }
          <div>
            <p className="font-medium text-ink-950">{m.title}</p>
            <p className="max-w-sm truncate text-xs text-ink-500">{m.description || 'No description'}</p>
          </div>
        </div>

  },
  {
    key: 'guests',
    header: 'Min. guests',
    align: 'center',
    render: (m) =>
    <span className="inline-flex items-center gap-1.5 text-ink-700">
          <Users className="h-3.5 w-3.5 text-ink-400" /> {m.minimumGuests}
        </span>

  },
  { key: 'dishes', header: 'Dishes', align: 'center', render: (m) => m.numberOfDishes },
  {
    key: 'price',
    header: 'Price',
    align: 'right',
    render: (m) => <span className="font-medium">{convertToThousand(m.price)}</span>
  },
  { key: 'created', header: 'Created', render: (m) => formatDate(m.createdAt) },
  {
    key: 'actions',
    header: '',
    align: 'right',
    width: '110px',
    render: (m) =>
    <RowActions
      onView={() => navigate(`/admin/special-services/${m.id}`)}
      onEdit={() =>
      setEditing({
        id: m.id,
        title: m.title,
        description: m.description,
        minimumGuests: m.minimumGuests,
        numberOfDishes: m.numberOfDishes,
        price: m.price,
        menuPic: null,
        image: m.image
      })
      }
      onDelete={() => setDeleting(m)} />

  }];


  return (
    <div>
      <PageHeader
        title="Special Services"
        description="Curated multi-course experiences like anniversaries and date nights, sold as a fixed package."
        action={
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setEditing(emptySpecialMenu)}>
            New special service
          </Button>
        } />


      <Card>
        <CardHeader
          title="Special service catalogue"
          description={`${menus.length} special service${menus.length === 1 ? '' : 's'} on record`} />

        <Toolbar search={search} onSearch={setSearch} placeholder="Search special services…" />
        <DataTable
          columns={columns}
          rows={menus}
          rowKey={(m) => m.id}
          onRowClick={(m) => navigate(`/admin/special-services/${m.id}`)}
          emptyTitle={loading ? 'Loading special services…' : 'No special services found'}
          emptyDescription={
          loading ?
          'Fetching the special service catalogue.' :
          'Create a special service to feature it as a bookable package.'
          } />

      </Card>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'Edit special service' : 'New special service'}
        description="Shown to customers as a curated, fixed-price experience."
        size="lg">

        {editing ?
        <Formik
          initialValues={editing}
          validationSchema={schema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              const input: SpecialMenuInput = {
                title: values.title,
                description: values.description || undefined,
                minimumGuests: Number(values.minimumGuests),
                numberOfDishes: Number(values.numberOfDishes),
                price: Number(values.price),
                menuPic: values.menuPic
              };
              const menu = values.id ?
              await updateSpecialMenu(values.id, input) :
              await createSpecialMenu(input);
              upsert(menu);
              toast.success(values.id ? 'Special service updated.' : 'Special service created.');
              setEditing(null);
            } catch (err) {
              toast.error(errorMessage(err, 'Could not save this special service.'));
            } finally {
              setSubmitting(false);
            }
          }}>

            {({ isSubmitting }) =>
          <Form>
                <div className="max-h-[65vh] space-y-5 overflow-y-auto px-6 py-5">
                  <TextField name="title" label="Title" placeholder="Anniversary Dinner" />
                  <TextAreaField
                name="description"
                label="Description"
                placeholder="What's included in this experience?" />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <NumberField name="minimumGuests" label="Minimum guests" placeholder="2" />
                    <NumberField name="numberOfDishes" label="Number of dishes" placeholder="5" />
                    <NumberField name="price" label="Price" prefix="₦" placeholder="150000" />
                  </div>
                  <ImageField
                name="menuPic"
                label="Menu photo"
                hint="Shown to customers browsing special services."
                previewUrl={editing.image} />

                </div>
                <ModalFooter>
                  <Button
                variant="secondary"
                type="button"
                disabled={isSubmitting}
                onClick={() => setEditing(null)}>

                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving…' : editing.id ? 'Save changes' : 'Create special service'}
                  </Button>
                </ModalFooter>
              </Form>
          }
          </Formik> :
        null}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete special service"
        message={`Delete "${deleting?.title}"? This cannot be undone.`}
        onConfirm={() => deleting && handleDelete(deleting)}
        onClose={() => setDeleting(null)} />

    </div>);

}
