import { Button, Card, Col, ListGroup, Row, Spinner } from "react-bootstrap"
import { convertToThousand } from "../../utils/helpers"
import IconButton from "../../components/custom-button/IconButton"
import CustomIconButton from "../../components/custom-button/custom-icon-button"
import NewChefModal from "../../components/modals/chef/NewChefModal"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import api from "../../app/api"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import moment from "moment"

const SettingsPage = () => {
    const [onCreateChef, setOnCreateChef] = useState(false)
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
            path: '/chefs',
            count: '2'
        },


    ]
    return (
        <div>
            <div className="d-flex justify-content-end gap-3 align-items-center">
                {/* <a href="/dashboard/menus">
                    + Add Menu
                </a> */}
                <CustomIconButton onClick={() => setOnCreateChef(true)} className="text-light" title="Send Broadcast" />
                <CustomIconButton variant="outline" onClick={() => setOnCreateChef(true)} className="border border-3" title="Push notification" />

            </div>
            <Row className="mt-4">

                {
                    infoCardData.map((card) => (<Col>
                        <Card className="rounded-3">
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
                            <Button>Add New</Button>
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
                                                                <ListGroup.Item
                                                                >
                                                                    Update
                                                                </ListGroup.Item>
                                                            </ListGroup>

                                                            <ListGroup variant="flush">
                                                                <ListGroup.Item
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
                            <Button>Add New</Button>
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
                                                                <ListGroup.Item
                                                                >
                                                                    Update
                                                                </ListGroup.Item>
                                                            </ListGroup>

                                                            <ListGroup variant="flush">
                                                                <ListGroup.Item
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
        </div>
    )
}
export default SettingsPage