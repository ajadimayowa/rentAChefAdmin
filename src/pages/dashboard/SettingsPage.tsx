import { Button, Card, Col, ListGroup, Row, Spinner } from "react-bootstrap"
import { convertToThousand } from "../../utils/helpers"
import IconButton from "../../components/custom-button/IconButton"
import CustomIconButton from "../../components/custom-button/custom-icon-button"
import NewChefModal from "../../components/modals/chef/NewChefModal"
import AddServiceModal from "../../components/modals/settings/AddServiceModal"
import AddCategoryModal from "../../components/modals/settings/AddCategoryModal"
import BroadcastModal from "../../components/modals/settings/BroadcastModal"
import PushNotificationModal from "../../components/modals/settings/PushNotificationModal"
import { use, useEffect, useState } from "react"
import ConfirmModal from "../../components/modals/ConfirmModal"
import { toast } from "react-toastify"
import api from "../../app/api"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import moment from "moment"

const SettingsPage = () => {
    const [onCreateChef, setOnCreateChef] = useState(false)
    const [showAddService, setShowAddService] = useState(false)
    const [showAddCategory, setShowAddCategory] = useState(false)
    const [showBroadcast, setShowBroadcast] = useState(false)
    const [showPush, setShowPush] = useState(false)
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
    const [services, setServices] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [serviceEdit, setServiceEdit] = useState<any | null>(null);
    const [categoryEdit, setCategoryEdit] = useState<any | null>(null);
    const [bySearch, setBySearch] = useState(false);
    const [searchedName, setSearchedName] = useState('')


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

    const searchChef = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/chefs?name=${searchedName}&limit=${limit}&page=${page}`);
            setServices(res?.data?.payload);
            // setTotalItem({ ...res.data?.meta });
            // loadStates()
            // localStorage.setItem('userToken',res?.data?.token);
            // localStorage.setItem('userId',res?.data?.payload?.id);
            // dispatch(setUserData(res?.data?.payload))
            // navigate('/dashboard')
            // toast.success('Login Successful!')
            // setUserEmail(values.email);
            setLoading(false);
            // setStep(2); // proceed to OTP verification
        } catch (error) {
            console.error(error);
            setLoading(false);
            toast.error('Invalid Credentials')
        }
    }
    const fetchServices = async () => {
        setLoading(true);
        if (bySearch) {
            searchChef()
        } else {
            try {
                const res = await api.get(`service/services`);
                setServices(res?.data?.payload);
                setTotalItem({ ...res.data?.meta });
                // loadStates()
                // localStorage.setItem('userToken',res?.data?.token);
                // localStorage.setItem('userId',res?.data?.payload?.id);
                // dispatch(setUserData(res?.data?.payload))
                // navigate('/dashboard')
                // toast.success('Login Successful!')
                // setUserEmail(values.email);
                setLoading(false);
                // setStep(2); // proceed to OTP verification
            } catch (error) {
                console.error(error);
                setLoading(false);
                toast.error('Network error!')
            }
        }
    };

    const fetchCategories = async () => {
        setLoading(true);
        if (bySearch) {
            searchChef()
        } else {
            try {
                const res = await api.get(`category/categories`);
                setCategories(res?.data?.payload);
                // setTotalItem({ ...res.data?.meta });
                // loadStates()
                // localStorage.setItem('userToken',res?.data?.token);
                // localStorage.setItem('userId',res?.data?.payload?.id);
                // dispatch(setUserData(res?.data?.payload))
                // navigate('/dashboard')
                // toast.success('Login Successful!')
                // setUserEmail(values.email);
                setLoading(false);
                // setStep(2); // proceed to OTP verification
            } catch (error) {
                console.error(error);
                setLoading(false);
                toast.error('Network error!')
            }
        }
    };

    useEffect(() => {
        fetchServices();
        fetchCategories()
    }, [refData])

    const [confirmShow, setConfirmShow] = useState(false)
    const [confirmData, setConfirmData] = useState<{ id?: string; kind?: 'service' | 'category'; name?: string } | null>(null)

    const handleDeleteService = (id?: string, name?: string) => {
        if (!id) return;
        setConfirmData({ id, kind: 'service', name });
        setConfirmShow(true);
    };

    const handleDeleteCategory = (id?: string, name?: string) => {
        if (!id) return;
        setConfirmData({ id, kind: 'category', name });
        setConfirmShow(true);
    };

    const performDelete = async () => {
        if (!confirmData || !confirmData.id) return;
        setConfirmShow(false);
        try {
            setLoading(true);
            if (confirmData.kind === 'service') {
                await api.delete(`service/${confirmData.id}`);
                toast.success('Service deleted');
            } else {
                await api.delete(`category/${confirmData.id}`);
                toast.success('Category deleted');
            }
            setRefData(!refData);
            setLoading(false);
            setConfirmData(null);
        } catch (error) {
            console.error(error);
            setLoading(false);
            toast.error('Failed to delete');
        }
    };

    
    const infoCardData = [
        {
            id: '1',
            label: 'Account',
            desc: 'Total revenue',
            icon: 'bi bi-speedometer2',
            path: '/dashboard',
            count: '5',
            isMoney: true
        },
        {
            id: '2',
            label: 'User',
            desc: 'No of active customers',
            icon: 'bi bi-people-fill',
            path: '/admin',
            count: '3'
        },
        {
            id: '3',
            label: 'Notifications',
            desc: 'No of active chefs',
            icon: 'bi bi-bell-fill',
            path: '/dashboard/notifications',
            count: '2'
        },


    ]
    return (
        <div>
            <div className="d-flex justify-content-end gap-3 align-items-center">
                {/* <a href="/dashboard/menus">
                    + Add Menu
                </a> */}
                <CustomIconButton onClick={() => setShowBroadcast(true)} className="text-light" title="Send Broadcast" />
                <CustomIconButton variant="outline" onClick={() => setShowPush(true)} className="border border-3" title="Push notification" />

            </div>
            <Row className="mt-4">

                {
                    infoCardData.map((card) => (<Col>
                        <Card onClick={()=>navigate(card.path)} className="rounded-3">
                            <Card.Body>
                                <p className="fw-bold m-0 p-0">
                                    {
                                        card.label
                                    }
                                </p>
                                <h3>
                                    <i className={card.icon}></i>

                                </h3>

                            </Card.Body>
                        </Card>
                    </Col>))
                }
            </Row>

            <Row className="mt-4">

                <Col>
                    <Card className="rounded-3">
                            <Card.Header className="d-flex justify-content-between">
                            <p className="fw-bold m-0 p-0">
                                Available Services
                            </p>
                            <Button onClick={() => setShowAddService(true)}>Add New</Button>
                        </Card.Header>
                        <Card.Body>
                            <table className="table table-striped table-hover">
                                <thead>
                                    <tr>
                                        <th scope="col">#</th>
                                        <th scope="col">Name</th>
                                        <th scope="col">Created on</th>
                                        <th scope="col"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        services.map((service,index)=>(
                                            <tr onClick={()=>navigate(`/dashboard/service/${service?.id}`)}>
                                        <th scope="row">{index + 1}</th>
                                        <td>{service?.name}</td>
                                        <td>{moment(service?.createdAt).format('D/MM/Y')}</td>
                                        <td className="table-icon">

                                            <i className="bi bi-three-dots-vertical"></i>
                                            <div className="content p-2 card border shadow position-absolute mr-2">
                                                <Card className="rounded rounded-3 border-0 shadow-lg text-left" style={{ minWidth: '10rem' }}>
                                                    {
                                                        <>
                                                        <ListGroup variant="flush">
                                                                <ListGroup.Item onClick={(e)=>{e.stopPropagation();  navigate(`/dashboard/service-pricing/${service?.id}`) }}
                                                                >
                                                                    View pricing
                                                                </ListGroup.Item>
                                                            </ListGroup>

                                                            <ListGroup variant="flush">
                                                                <ListGroup.Item onClick={(e)=>{ e.stopPropagation(); setShowAddService(true); setServiceEdit({ id: service?.id, name: service?.name, description: service?.description, isActive: service?.isActive }) }}
                                                                >
                                                                    Update
                                                                </ListGroup.Item>
                                                            </ListGroup>

                                                            <ListGroup variant="flush">
                                                                <ListGroup.Item onClick={(e)=>{ e.stopPropagation(); handleDeleteService(service?.id) }}
                                                                >
                                                                    Delete

                                                                </ListGroup.Item>
                                                            </ListGroup>
                                                        </>
                                                    }
                                                </Card>
                                            </div>
                                        </td>
                                    </tr>
                                        ))
                                    }
                                    <tr>{
                                        loading &&
                                        <td colSpan={5}>{<Spinner size="sm"/>}</td>
                                        }
                                    </tr>
                                </tbody>
                            </table>



                        </Card.Body>
                    </Card>
                </Col>

                <Col>
                    <Card className="rounded-3">
                            <Card.Header className="d-flex justify-content-between">
                            <p className="fw-bold m-0 p-0">
                                Chef Categories
                            </p>
                            <Button onClick={() => setShowAddCategory(true)}>Add New</Button>
                        </Card.Header>
                        <Card.Body>
                            <table className="table table-striped table-hover">
                                <thead>
                                    <tr>
                                        <th scope="col">#</th>
                                        <th scope="col">Name</th>
                                        <th scope="col">Created on</th>
                                        <th scope="col"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        categories.map((service,index)=>(
                                                <tr>
                                        <th scope="row">{index + 1}</th>
                                        <td>{service?.name}</td>
                                        <td>{moment(service?.createdAt).format('D/MM/Y')}</td>
                                        <td className="table-icon">

                                            <i className="bi bi-three-dots-vertical"></i>
                                            <div className="content p-2 card border shadow position-absolute mr-2">
                                                <Card className="rounded rounded-3 border-0 shadow-lg text-left" style={{ minWidth: '10rem' }}>
                                                    {
                                                        <>
                                                            <ListGroup variant="flush">
                                                                <ListGroup.Item onClick={(e)=>{ e.stopPropagation(); setShowAddCategory(true); setCategoryEdit({ id: service?.id, name: service?.name, description: service?.description }) }}
                                                                >
                                                                    Update
                                                                </ListGroup.Item>
                                                            </ListGroup>

                                                            <ListGroup variant="flush">
                                                                    <ListGroup.Item onClick={(e)=>{ e.stopPropagation(); handleDeleteCategory(service?.id) }}
                                                                    >
                                                                        Delete

                                                                    </ListGroup.Item>
                                                            </ListGroup>
                                                        </>
                                                    }
                                                </Card>
                                            </div>
                                        </td>
                                    </tr>

                                        ))
                                    }
                                </tbody>
                            </table>



                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <NewChefModal on={onCreateChef} off={() => setOnCreateChef(false)} onLogin={() => console.log('ok')} />
            <AddServiceModal initial={serviceEdit ?? undefined} on={showAddService} off={() => { setShowAddService(false); setServiceEdit(null); }} onDone={() => setRefData(!refData)} />
            <AddCategoryModal initial={categoryEdit ?? undefined} on={showAddCategory} off={() => { setShowAddCategory(false); setCategoryEdit(null); }} onDone={() => setRefData(!refData)} />
            <BroadcastModal on={showBroadcast} off={() => setShowBroadcast(false)} />
            <PushNotificationModal on={showPush} off={() => setShowPush(false)} />
            <ConfirmModal
                show={confirmShow}
                title={confirmData?.kind === 'service' ? 'Delete Service' : 'Delete Category'}
                body={confirmData?.name ? `Delete "${confirmData.name}"? This action cannot be undone.` : 'Are you sure you want to delete this item?'}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={performDelete}
                onCancel={() => setConfirmShow(false)}
            />
        </div>
    )
}
export default SettingsPage