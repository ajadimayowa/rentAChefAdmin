import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProcurementModal from '../../components/modals/procurement/ProcurementModal';
import SendNotification from '../../components/modals/notification/SendNotification';
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

const Customer: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [booking, setBooking] = useState<Booking | any>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showProcurementModal, setShowProcurementModal] = useState(false);
    const [showSendNotificationModal, setShowSendNotificationModal] = useState(false);

    useEffect(() => {
        const fetchBooking = async () => {
            setLoading(true);
            try {
                const res = await api.get(`admin/user/${id}`);
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
            <div className='d-flex justify-content-end gap-3'>
                <CustomButton variant='outline' className='border border-1 text-danger border-danger' title='Disable User'/>
                <CustomButton title='Send Notification' onClick={() => setShowSendNotificationModal(true)} />
            </div>

            <hr />
            <div className='d-flex w-100 gap-2'>
                <Card className='w-50'>
                    <Card.Header className='fw-bold'>
                        Client Information
                    </Card.Header>
                    <Card.Body className='d-flex gap-3 align-items-center'>
                        <div>
                            {booking?.profilePic ? (
                                <Image height={250} width={300} className="rounded-3" src={booking?.profilePic} />
                            ) : (
                                <i className="bi bi-person-bounding-box fs-1"></i>
                            )}
                        </div>

                        <div>
                            <p className='text-capitalize mt-3'><strong>Fullname :</strong> {booking?.fullName}</p>
                            <p className='text-capitalize'><strong>Phone Number :</strong> {booking?.phone ?? '-'}</p>
                            <p className='text-capitalize'><strong>Marital Status :</strong> {booking?.maritalStatus}</p>
                            <p className='text-capitalize'><strong>Date of Birth :</strong> {moment(booking?.dob).format('MM/DD/YYYY')}</p>
                            <p className='text-capitalize'><strong>Joined on :</strong> {moment(booking?.createdAt).format('MM/DD/YYYY')}</p>
                        </div>
                    </Card.Body>

                </Card>

                <Card className='w-50'>
                    <Card.Header className='fw-bold'>
                        Health Information
                    </Card.Header>
                    <Card.Body className='d-flex gap-3 align-items-center'>
                        <div>
                            
                            <p className='text-capitalize'><strong>Allergies :</strong> {booking?.healthInformation?.allergies[0] ?? '-'}</p>
                            <p className='text-capitalize'><strong>Health Note :</strong> {booking?.healthInformation?.healthDetails ?? '-'}</p>
                        </div>
                    </Card.Body>

                </Card>
            </div>


            <hr />
            <div className='d-flex w-100 gap-2'>
                <Card className='w-50'>
                    <Card.Header className='fw-bold'>
                        Location Information
                    </Card.Header>
                    <Card.Body className='d-flex gap-3 align-items-center'>
                        <div>
                            <p className='text-capitalize'><strong>Home Address :</strong> {`${booking?.location?.home ?? '-'}`}</p>
                            <p className='text-capitalize'><strong>Office Address :</strong> {`${booking?.location?.office ?? '-'}`}</p>
                            <p className='text-capitalize'><strong>City :</strong> {`${booking?.location?.city ?? '-'}`}</p>
                            <p className='text-capitalize'><strong>State :</strong> {`${booking?.location?.state ?? '-'}`}</p>
                        </div>
                    </Card.Body>

                </Card>

                <Card className='w-50'>
                    <Card.Header className='fw-bold'>
                        Next of Kin Information
                    </Card.Header>
                    <Card.Body className='d-flex gap-3 align-items-center'>
                        <div>
                            <p className='text-capitalize mt-3'><strong>Fullname :</strong> {booking?.nok?.fullName ?? '-'}</p>
                            <p className='text-capitalize'><strong>Phone Number :</strong> {booking?.nok?.phone ?? '-'}</p>
                            <p className='text-capitalize'><strong>Relationship :</strong> {booking?.nok?.relationship ?? '-'}</p>
                        </div>
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

            {showSendNotificationModal && (
                <SendNotification
                    show={true}
                    handleClose={() => setShowSendNotificationModal(false)}
                    userId={booking?.id}
                    onSuccess={() => { /* optionally refresh or show feedback */ }}
                />
            )}
        </div>
    );
}
export default Customer;