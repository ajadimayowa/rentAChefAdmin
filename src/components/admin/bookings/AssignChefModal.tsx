import React, { useEffect, useState } from 'react';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import { Modal, ModalFooter } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { SearchSelectField } from '../../form/Fields';
import { listChefs, assignBookingChef, type AssignedChef } from '../../../services/admin/adminServices';
import { ApiError } from '../../../config/api';

const errorMessage = (err: unknown, fallback: string): string =>
err instanceof ApiError ? err.message : fallback;

const schema = Yup.object({
  chefId: Yup.string().required('Select a chef to assign')
});

export function AssignChefModal({
  open,
  onClose,
  bookingId,
  currentChefId,
  onAssigned



}: {open: boolean;onClose: () => void;bookingId: string;currentChefId?: string;onAssigned: (chef: AssignedChef, status: string) => void;}) {
  const [chefs, setChefs] = useState<{id: string;label: string;}[]>([]);
  const [loadingChefs, setLoadingChefs] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoadingChefs(true);
    listChefs({ status: 'approved', limit: 200 }).
    then((res) => setChefs(res.payload.map((c) => ({ id: c.id, label: c.name })))).
    catch(() => toast.error('Could not load chefs.')).
    finally(() => setLoadingChefs(false));
  }, [open]);

  return (
    <Modal open={open} onClose={onClose} title="Assign chef" description="Pick a specific chef to assign to this booking." size="md">
      <Formik
        initialValues={{ chefId: currentChefId ?? '' }}
        enableReinitialize
        validationSchema={schema}
        onSubmit={async (values, helpers) => {
          try {
            const res = await assignBookingChef(bookingId, values.chefId);
            onAssigned(res.payload.chef, res.payload.status);
            toast.success(`${res.payload.chef.fullName} assigned to this booking.`);
            onClose();
          } catch (err) {
            toast.error(errorMessage(err, 'Could not assign chef.'));
          } finally {
            helpers.setSubmitting(false);
          }
        }}>

        {({ isSubmitting }) =>
        <Form>
            <div className="p-6">
              <SearchSelectField
              id="assign-chef"
              name="chefId"
              label="Chef"
              placeholder={loadingChefs ? 'Loading chefs…' : 'Search chefs by name…'}
              disabled={loadingChefs}
              data={chefs} />

            </div>
            <ModalFooter>
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || loadingChefs}>
                {isSubmitting ? 'Assigning…' : 'Assign chef'}
              </Button>
            </ModalFooter>
          </Form>
        }
      </Formik>
    </Modal>);

}
