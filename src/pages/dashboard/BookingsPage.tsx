import { Button, Card, Col, Image, Row, Spinner, ListGroup } from "react-bootstrap"
import { convertToThousand, cutString } from "../../utils/helpers"
import IconButton from "../../components/custom-button/IconButton"
import CustomIconButton from "../../components/custom-button/custom-icon-button"
import NewChefModal from "../../components/modals/chef/NewChefModal"
import { useEffect, useState } from "react"
import ConfirmModal from "../../components/modals/ConfirmModal"
import ReusableInputs from "../../components/custom-input/ReusableInputs"
import { Form, Formik } from "formik"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import api from "../../app/api"
import { toast } from "react-toastify"
import moment from "moment"

const BookingsPage = () => {
    const [onCreateChef, setOnCreateChef] = useState(false);
    const [loading, setLoading] = useState(false);
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(1);
    const [totalItem, setTotalItem] = useState({
        total: 0,
        limit: 0,
        page: 0,
        totalPages: 0,
    });
    const [step, setStep] = useState(1);
    const [userEmail, setUserEmail] = useState("");
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [refData, setRefData] = useState(false);
    const [bookings, setBookings] = useState<any[]>([]);
    const [bySearch, setBySearch] = useState(false);
    const [searchedName, setSearchedName] = useState('')
    const [filter, setFilter] = useState<'all'|'upcoming'|'ongoing'|'completed'>('all')
    const [searchBy, setSearchBy] = useState<'user'|'chef'>('user')


    const handlePagination = (value: number) => {
        setPage(value);
        setRefData(!refData);
    };

    const handlePrevious = () => {
        setPage(totalItem.page - 1);
        setRefData(!refData)
    };

    const handleNext = () => {
        // console.log({ seeCurren: totalItem.currentPage })
        setPage(totalItem?.page + 1);
        setRefData(!refData)
    };

    const infoCardData = [
        {
            id: '1',
            label: 'Revenue',
            desc: 'Total revenue',
            icon: 'bi bi-speedometer2',
            path: '/dashboard',
            count: '5',
            isMoney: true
        },
        {
            id: '2',
            label: 'Customers',
            desc: 'No of active customers',
            icon: 'bi bi-person-workspace',
            path: '/admin',
            count: '3'
        },
        {
            id: '3',
            label: 'Chefs',
            desc: 'No of active chefs',
            icon: 'bi bi-backpack',
            path: '/chefs',
            count: '2'
        }

    ]

    const searchBookings = async () => {
        setLoading(true);
        try {
            // choose query param according to searchBy selection
            const q = new URLSearchParams();
            if (searchBy === 'user') q.append('searchByUserName', searchedName);
            else q.append('searchByChefName', searchedName);
            q.append('limit', String(limit));
            q.append('page', String(page));
            const res = await api.get(`/bookings?${q.toString()}`);
            setBookings(res?.data?.payload || []);
            if (res?.data?.pagination) {
                const p = res.data.pagination;
                setTotalItem({ total: p.total, limit: p.limit, page: p.page, totalPages: p.pages });
            }
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
            toast.error('Network error')
        }
    }

    const fetchBookings = async (filter?: string) => {
        setLoading(true);
        if (bySearch) {
            searchBookings()
            return;
        }
        try {
            // try common endpoints; if backend differs, adjust accordingly
            const query: any = { limit, page };
            // map frontend filter to backend status values
            if (filter && filter !== 'all') {
                if (filter === 'upcoming') query.status = 'confirmed';
                else if (filter === 'ongoing') query.status = 'ongoing';
                else if (filter === 'completed') query.status = 'completed';
                else query.status = filter;
            }
            const qs = Object.keys(query).map(k => `${k}=${query[k]}`).join('&');
            let res;
            try {
                res = await api.get(`/booking/bookings?${qs}`);
            } catch (err) {
                res = await api.get(`/bookings?${qs}`);
            }
            setBookings(res?.data?.payload || []);
            if (res?.data?.pagination) {
                const p = res.data.pagination;
                setTotalItem({ total: p.total, limit: p.limit, page: p.page, totalPages: p.pages });
            }
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
            toast.error('Network error')
        }
    };

    useEffect(() => {
        fetchBookings()
    }, [refData])
    useEffect(() => {
        // when filter changes, reset to first page and fetch
        setPage(1);
        fetchBookings(filter);
    }, [filter])
    const [confirmShow, setConfirmShow] = useState(false)
    const [confirmData, setConfirmData] = useState<{ id?: string; name?: string } | null>(null)

    const promptDeleteBooking = (id?: string, name?: string) => {
        if (!id) return;
        setConfirmData({ id, name });
        setConfirmShow(true);
    }

    const performDeleteBooking = async () => {
        if (!confirmData?.id) return;
        setConfirmShow(false);
        try {
            setLoading(true);
            try {
                await api.delete(`/booking/${confirmData.id}`);
            } catch (err) {
                await api.delete(`/bookings/${confirmData.id}`);
            }
            toast.success('Booking deleted');
            setRefData(!refData);
            setLoading(false);
            setConfirmData(null);
        } catch (error) {
            console.error(error);
            setLoading(false);
            toast.error('Failed to delete booking');
        }
    }
    return (
        <div>
            <div className="">
                <h5>Bookings</h5>
                <p>Manage all bookings from here.</p>


            </div>
            <div className="mt-5">
                <div className="w-100 d-flex justify-content-between  mb-4">
                    <div className="d-flex w-100  justify-content-between align-items-center">
                        <Formik
                            initialValues={{ 'userSearch': '' }}
                            onSubmit={(v) => { setBySearch(true);setSearchedName(v?.userSearch); setRefData(!refData) }}
                        >
                            {
                                ({ handleSubmit }) => (
                                    <Form onSubmit={handleSubmit} className="w-25">
                                        <ReusableInputs className="w-50" onChange={(e) => setSearchedName(e.currentTarget.value)} placeholder="Search by booking id/name of client..." inputType="text-input" id="userSearch" name="userSearch" />
                                    </Form>
                                )
                            }

                        </Formik>

                        <div className="ms-2">
                            <select className="form-select form-select-sm" value={searchBy} onChange={(e) => setSearchBy(e.currentTarget.value as 'user'|'chef')}>
                                <option value="user">Search user</option>
                                <option value="chef">Search chef</option>
                            </select>
                        </div>

                        <div className="ms-3">
                            <Button variant={filter === 'all' ? 'primary' : 'outline-primary'} size="sm" onClick={() => setFilter('all')}>All</Button>{' '}
                            <Button variant={filter === 'upcoming' ? 'primary' : 'outline-primary'} size="sm" onClick={() => setFilter('upcoming')}>Upcoming</Button>{' '}
                            <Button variant={filter === 'ongoing' ? 'primary' : 'outline-primary'} size="sm" onClick={() => setFilter('ongoing')}>Ongoing</Button>{' '}
                            <Button variant={filter === 'completed' ? 'primary' : 'outline-primary'} size="sm" onClick={() => setFilter('completed')}>Completed</Button>
                        </div>

                        {/* <CustomIconButton onClick={() => setOnCreateChef(true)} className="text-light" title="+ Add New" /> */}
                    </div>
                    <div></div>

                </div>

                <table className="table">
                    <thead className="thead-light">
                        <tr>
                            <th className="bg-primary text-light" scope="col">#</th>
                            <th className="bg-primary text-light" scope="col">Booking Id</th>
                            <th className="bg-primary text-light" scope="col">Type</th>
                            <th className="bg-primary text-light" scope="col">Customer name</th>
                            <th className="bg-primary text-light" scope="col">Chef</th>
                            <th className="bg-primary text-light" scope="col">State</th>
                            <th className="bg-primary text-light" scope="col">Location</th>
                            <th className="bg-primary text-light" scope="col">Created At</th>
                            <th className="bg-primary text-light" scope="col"></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="text-center"><td colSpan={9}>{loading && <Spinner />}</td></tr>
                        {
                            bookings.map((b, index: number) => (
                                <tr role="button" key={b?.id} onClick={() => navigate(`/dashboard/booking/${b?.id}`)}>
                                    <th scope="row">{index + 1}</th>
                                    <td>{cutString(b?.id, 5)}</td>
                                    <td>{b?.bookingType || '—'}</td>
                                    <td>{b?.clientId?.fullName || b?.clientId?.firstName || b?.clientId?.email || '—'}</td>
                                    <td>{b?.chefId?.name || '—'}</td>
                                    
                                    <td>{b?.clientId?.location?.state || '—'}</td>
                                    <td>{b?.clientId?.location?.city || b?.clientId?.location?.home || '—'}</td>
                                    <td>{moment(b?.createdAt).format('D/MM/Y')}</td>
                                    <td className="table-icon">
                                        <i className="bi bi-three-dots-vertical"></i>
                                        <div className="content p-2 card border shadow position-absolute mr-2">
                                            <Card className="rounded rounded-3 border-0 shadow-lg text-left" style={{ minWidth: '10rem' }}>
                                                <ListGroup variant="flush">
                                                    <ListGroup.Item onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/booking/${b?.id}`) }}>
                                                        View
                                                    </ListGroup.Item>
                                                    <ListGroup.Item onClick={(e) => { e.stopPropagation()}}>
                                                        Edit
                                                    </ListGroup.Item>
                                                    <ListGroup.Item onClick={(e) => { e.stopPropagation(); promptDeleteBooking(b?.id, b?.clientId?.fullName || b?.clientId?.firstName) }}>
                                                        Delete
                                                    </ListGroup.Item>
                                                </ListGroup>
                                            </Card>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        }

                        <tr className="text-center"><td colSpan={9}>{!loading && bookings?.length < 1 && 'No Data Available'}</td></tr>
                    </tbody>
                </table>
            </div>

            {bookings.length > 0 && (
                <nav className="mt-5" aria-label="Page navigation example">
                    <ul className="pagination justify-content-center">
                        <Button onClick={handlePrevious} className="page-item" disabled={totalItem.page == 1}>
                            Previous
                        </Button>
                        {Array(totalItem.totalPages)
                            .fill('')
                            .map((value: any, index: any): any => (
                                <li
                                    key={index}
                                    style={{
                                        backgroundColor: index + 1 == totalItem.page ? '#3F718D' : '',
                                        cursor: 'pointer',
                                    }}
                                    className="page-item"
                                    onClick={() => handlePagination(index + 1)}
                                >
                                    <a className="page-link">{index + 1}</a>
                                </li>
                            ))}
                        <Button onClick={handleNext} className="page-item" disabled={totalItem.page == totalItem.totalPages}>
                            Next
                        </Button>
                    </ul>
                </nav>
            )}
            <NewChefModal on={onCreateChef} off={() => {setOnCreateChef(false); window.location.reload(); setRefData(!refData)}} onLogin={() => console.log('ok')} />
            <ConfirmModal
                show={confirmShow}
                title={'Delete Booking'}
                body={confirmData?.name ? `Delete "${confirmData.name}"? This action cannot be undone.` : 'Are you sure you want to delete this booking?'}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={performDeleteBooking}
                onCancel={() => setConfirmShow(false)}
            />
        </div>
    )
}
export default BookingsPage