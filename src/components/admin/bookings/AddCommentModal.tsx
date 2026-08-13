import React from 'react';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import { Modal, ModalFooter } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { TextAreaField } from '../../form/Fields';
import { addBookingComment } from '../../../services/admin/adminServices';
import type { BookingComment } from '../../../services/booking/bookingServices';
import { ApiError } from '../../../config/api';

const errorMessage = (err: unknown, fallback: string): string =>
err instanceof ApiError ? err.message : fallback;

const schema = Yup.object({
  text: Yup.string().trim().min(1, 'Write a comment first').required('Write a comment first')
});

export function AddCommentModal({
  open,
  onClose,
  bookingId,
  onAdded



}: {open: boolean;onClose: () => void;bookingId: string;onAdded: (comments: BookingComment[]) => void;}) {
  return (
    <Modal open={open} onClose={onClose} title="Add comment" description="Leave an internal note for the team on this booking." size="md">
      <Formik
        initialValues={{ text: '' }}
        validationSchema={schema}
        onSubmit={async (values, helpers) => {
          try {
            const res = await addBookingComment(bookingId, values.text);
            onAdded(res.payload);
            toast.success('Comment added.');
            helpers.resetForm();
            onClose();
          } catch (err) {
            toast.error(errorMessage(err, 'Could not add comment.'));
          } finally {
            helpers.setSubmitting(false);
          }
        }}>

        {({ isSubmitting }) =>
        <Form>
            <div className="p-6">
              <TextAreaField name="text" label="Comment" rows={4} placeholder="Add a note about this booking…" />
            </div>
            <ModalFooter>
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Posting…' : 'Add comment'}
              </Button>
            </ModalFooter>
          </Form>
        }
      </Formik>
    </Modal>);

}
