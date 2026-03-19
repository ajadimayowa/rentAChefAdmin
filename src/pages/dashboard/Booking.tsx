import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProcurementModal from '../../components/modals/procurement/ProcurementModal';
import api from '../../app/api';
import { convertToThousand } from '../../utils/helpers';
import moment from 'moment';
import { Card, Col, Image, Row } from 'react-bootstrap';
import CustomButton from '../../components/custom-button/custom-button';

interface Booking {
    id: string;
    name: string;
    date: string;
    status: string;
    procurements: Procurement[];
}

interface Procurement {
    id: string;
    name: string;
    quantity: number;
}

const Booking: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [booking, setBooking] = useState<Booking | any>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showProcurementModal, setShowProcurementModal] = useState(false);

    useEffect(() => {
        const fetchBooking = async () => {
            setLoading(true);
            try {
                const res = await api.get(`booking/${id}`);
                if (res?.data?.success) {
                    setBooking(res?.data?.payload);
                    setLoading(false);
                }

            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchBooking();
        }
    }, [id]);

    const handleAddProcurement = (newProcurement: Procurement) => {
        if (booking) {
            setBooking({
                ...booking,
                procurements: [...booking.procurements, newProcurement],
            });
        }
        setShowProcurementModal(false);
    };

    // if (loading) return <div>Loading...</div>;
    // if (error) return <div>Error: {error}</div>;
    // if (!booking) return <div>Booking not found</div>;

    return (
        <div className="p-6">



            {
                booking?.procurementId ? "" :
                    <Card>
                        <Card.Body>
                            {
                                !booking?.procurementId && <div className='w-100 text-center'>
                                    <p className='fw-bold'>This Booking Has No Procurements</p>
                                    <CustomButton title='Add Procurement' onClick={() => setShowProcurementModal(true)} />

                                </div>

                            }
                        </Card.Body>
                    </Card>
            }

            <hr />
            <div className='d-flex w-100 gap-2'>
                <Card className='w-50'>
                    <Card.Header className='fw-bold'>
                        Booking Information
                    </Card.Header>
                    <Card.Body>
                        <p className='text-capitalize'><strong>Booking Type :</strong> {`${booking?.bookingType} Booking`}</p>
                        <p className='text-capitalize'><strong>Booked Service:</strong> {booking?.serviceId?.name}</p>
                        <p className='text-capitalize'><strong>Chef:</strong> {booking?.chefId?.name}</p>
                        <p className='text-capitalize'><strong>Chef Phone Number:</strong> {booking?.chefId?.phoneNumber ?? '-'}</p>
                        <p className='text-capitalize'><strong>Amount :</strong> {convertToThousand(booking?.totalAmount)}</p>
                        <p className='text-capitalize'><strong>Status:</strong> {booking?.status}</p>
                        <p className='text-capitalize'><strong> Start Date:</strong> {moment(booking?.startDate).format('MMMM Do YYYY')}</p>
                        <p className='text-capitalize'><strong> End Date:</strong> {moment(booking?.endDate).format('MMMM Do YYYY')}</p>
                        <p className='text-capitalize'><strong>Payment Channel :</strong> {booking?.paymentChannel}</p>
                        <p className='text-capitalize'><strong>Txn Ref :</strong> {booking?.paymentReference}</p>
                        <p className='text-capitalize'><strong>Special Note :</strong> {booking?.clientNote ?? '-'}</p>
                    </Card.Body>

                </Card>

                <Card className='w-50'>
                    <Card.Header className='fw-bold'>
                        Client Information
                    </Card.Header>
                    <Card.Body>
                        <div>
                            {booking?.clientId?.profilePic ? (
                                <Image height={250} width={300} className="rounded-3" src={booking?.clientId?.profilePic} />
                            ) : (
                                <i className="bi bi-person-bounding-box fs-1"></i>
                            )}
                        </div>
                        <p className='text-capitalize'><strong>Fullname :</strong> {booking?.clientId?.fullName}</p>
                        <p className='text-capitalize'><strong>Phone Number :</strong> {booking?.clientId?.phone ?? '-'}</p>
                        <p className='text-capitalize'><strong>Marital Status :</strong> {booking?.clientId?.maritalStatus}</p>
                        <p className='text-capitalize'><strong>Address :</strong> {`${booking?.clientId?.location?.home ?? '-'},${booking?.clientId?.location?.city ?? '-'},${booking?.clientId?.location?.state ?? '-'}`}</p>
                        <p className='text-capitalize'><strong>Allergies :</strong> {booking?.clientId?.healthInformation?.allergies[0] ?? '-'}</p>
                        <p className='text-capitalize'><strong>Health Note :</strong> {booking?.clientId?.healthInformation?.healthDetails ?? '-'}</p>
                    </Card.Body>

                </Card>
            </div>

            <hr />

            {
                booking?.procurementId &&
                <Card >
                    <Card.Header className='fw-bold'>
                        <div className='d-flex justify-content-between'>
                            <p className='p-0 m-0 fw-bold'> {
                                `Procurement details`
                            }</p>

                            <p className='p-0 m-0 fw-bold text-info'> {
                                `Payment Status: ${booking?.procurementId?.isProcurementPaid ? 'Paid' : 'Pending'}`
                            }</p>
                        </div>
                    </Card.Header>
                    <Card.Body>
                        <div className='d-flex justify-content-end'>
                            <p className='p-0 m-0 fw-bold'> {
                                `Total: ${convertToThousand(booking?.procurementId?.totalCost ?? 0)}`
                            }</p>
                        </div>
                        {
                            booking?.procurementId?.items.map((item: any, index: number) => (<Card className='m-2'>
                                <Card.Body>
                                    <Row className=''>
                                        <Col>{item.title}</Col>
                                        <Col>{convertToThousand(item.amount ?? 0)}</Col>
                                        <Col>{item.description}</Col>
                                    </Row>
                                </Card.Body>
                            </Card>))
                        }
                    </Card.Body>
                    <Card.Footer>

                    </Card.Footer>
                </Card>
            }

            {showProcurementModal && (
                <ProcurementModal
                    handleClose={() => setShowProcurementModal(false)}
                    show={true}
                    bookingId={booking?.id}
                />
            )}
        </div>
    );
}
export default Booking;