import React from 'react';
import { Form, Formik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'sonner';
import { Modal, ModalFooter } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { TextField, NumberField, SelectField, SearchSelectField } from '../../form/Fields';
import { addBookingPayment, type AddBookingPaymentResult } from '../../../services/admin/adminServices';
import { NIGERIAN_BANKS } from '../../../utils/nigerianBanks';
import { ApiError } from '../../../config/api';

const errorMessage = (err: unknown, fallback: string): string =>
err instanceof ApiError ? err.message : fallback;

const bankOptions = NIGERIAN_BANKS.map((bank) => ({ id: bank, label: bank }));

const schema = Yup.object({
  transactionRef: Yup.string().trim().required('Transaction reference is required'),
  mode: Yup.string().oneOf(['Cash', 'Transfer']).required('Select a payment mode'),
  bankName: Yup.string().when('mode', {
    is: 'Transfer',
    then: (s) => s.required('Select a bank'),
    otherwise: (s) => s.notRequired()
  }),
  accountNumber: Yup.string().when('mode', {
    is: 'Transfer',
    then: (s) => s.required('Account number is required'),
    otherwise: (s) => s.notRequired()
  }),
  amount: Yup.number().typeError('Enter a valid amount').positive('Amount must be greater than 0').required('Amount is required'),
  date: Yup.string().required('Payment date is required')
});

interface FormValues {
  transactionRef: string;
  mode: 'Cash' | 'Transfer';
  bankName: string;
  accountNumber: string;
  amount: number | '';
  date: string;
}

const initialValues: FormValues = {
  transactionRef: '',
  mode: 'Cash',
  bankName: '',
  accountNumber: '',
  amount: '',
  date: new Date().toISOString().slice(0, 10)
};

export function AddPaymentModal({
  open,
  onClose,
  bookingId,
  onSaved



}: {open: boolean;onClose: () => void;bookingId: string;onSaved: (result: AddBookingPaymentResult) => void;}) {
  return (
    <Modal open={open} onClose={onClose} title="Add payment details" description="Record a payment collected outside Paystack and mark this booking as paid." size="md">
      <Formik
        initialValues={initialValues}
        validationSchema={schema}
        onSubmit={async (values, helpers) => {
          try {
            const res = await addBookingPayment(bookingId, {
              transactionRef: values.transactionRef.trim(),
              mode: values.mode,
              bankName: values.mode === 'Transfer' ? values.bankName : undefined,
              accountNumber: values.mode === 'Transfer' ? values.accountNumber : undefined,
              amount: Number(values.amount),
              date: values.date
            });
            onSaved(res.payload);
            toast.success('Payment recorded — booking marked as paid.');
            helpers.resetForm();
            onClose();
          } catch (err) {
            toast.error(errorMessage(err, 'Could not record this payment.'));
          } finally {
            helpers.setSubmitting(false);
          }
        }}>

        {({ isSubmitting, values }) =>
        <Form>
            <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
              <TextField name="transactionRef" label="Transaction reference" placeholder="e.g. TRX-2026-0012" className="sm:col-span-2" />
              <SelectField
              name="mode"
              label="Payment mode"
              options={[
              { value: 'Cash', label: 'Cash' },
              { value: 'Transfer', label: 'Bank Transfer' }]
              } />

              <NumberField name="amount" label="Amount" prefix="₦" placeholder="0.00" />
              {values.mode === 'Transfer' &&
            <>
                  <SearchSelectField id="payment-bank-name" name="bankName" label="Bank name" data={bankOptions} placeholder="Search banks…" />
                  <TextField name="accountNumber" label="Account number" placeholder="0123456789" />
                </>
            }
              <TextField name="date" type="date" label="Payment date" className={values.mode === 'Transfer' ? 'sm:col-span-2' : ''} />
            </div>
            <ModalFooter>
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving…' : 'Mark as paid'}
              </Button>
            </ModalFooter>
          </Form>
        }
      </Formik>
    </Modal>);

}
