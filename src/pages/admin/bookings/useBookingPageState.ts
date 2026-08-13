import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { getBookingDetail, type BookingDetail } from '../../../services/booking/bookingServices';
import {
  updateBookingStatus,
  type AssignedChef,
  type AddBookingPaymentResult } from
'../../../services/admin/adminServices';
import {
  listBookingProcurements,
  type ProcurementRecord } from
'../../../services/admin/procurementServices';
import { ApiError } from '../../../config/api';

const errorMessage = (err: unknown, fallback: string): string =>
err instanceof ApiError ? err.message : fallback;

/** Shared data/handlers behind every workflow's booking detail page — fetch, status/chef/comment/procurement mutations, and modal visibility. */
export function useBookingPageState() {
  const { id } = useParams<{id: string;}>();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [procurementRecords, setProcurementRecords] = useState<ProcurementRecord[]>([]);
  const [procurementLoading, setProcurementLoading] = useState(true);

  const [assignChefOpen, setAssignChefOpen] = useState(false);
  const [addProcurementOpen, setAddProcurementOpen] = useState(false);
  const [addCommentOpen, setAddCommentOpen] = useState(false);
  const [addPaymentOpen, setAddPaymentOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getBookingDetail(id).
    then((res) => setBooking(res.payload)).
    catch((err) => toast.error(errorMessage(err, 'Could not load this booking.'))).
    finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setProcurementLoading(true);
    listBookingProcurements(id).
    then((res) => setProcurementRecords(res.payload)).
    catch(() => toast.error('Could not load procurement records.')).
    finally(() => setProcurementLoading(false));
  }, [id]);

  const handleStatusChange = async (nextStatus: string) => {
    if (!booking) return;
    setUpdating(true);
    try {
      await updateBookingStatus(booking.id, nextStatus);
      setBooking((prev) => prev ? { ...prev, status: nextStatus } : prev);
      toast.success(`Booking moved to ${nextStatus}.`);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not update booking status.'));
    } finally {
      setUpdating(false);
    }
  };

  const handleChefAssigned = (chef: AssignedChef, status: string) => {
    setBooking((prev) => prev ? { ...prev, status, chef: { id: chef.id, fullName: chef.fullName } } : prev);
  };

  const handleCommentAdded = (comments: BookingDetail['comments']) => {
    setBooking((prev) => prev ? { ...prev, comments } : prev);
  };

  const handleProcurementCreated = (record: ProcurementRecord) => {
    setProcurementRecords((prev) => [record, ...prev]);
  };

  const handlePaymentAdded = (result: AddBookingPaymentResult) => {
    setBooking((prev) =>
    prev ?
    {
      ...prev,
      paymentStatus: result.paymentStatus,
      modeOfPayment: result.modeOfPayment,
      transactnRef: result.transactnRef,
      paymentDetails: result.paymentDetails
    } :
    prev
    );
  };

  return {
    booking,
    loading,
    updating,
    procurementRecords,
    procurementLoading,
    assignChefOpen,
    setAssignChefOpen,
    addProcurementOpen,
    setAddProcurementOpen,
    addCommentOpen,
    setAddCommentOpen,
    addPaymentOpen,
    setAddPaymentOpen,
    handleStatusChange,
    handleChefAssigned,
    handleCommentAdded,
    handleProcurementCreated,
    handlePaymentAdded
  };
}
