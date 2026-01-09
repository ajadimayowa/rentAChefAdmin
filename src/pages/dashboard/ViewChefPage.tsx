import { Badge, Button, Card, Col, Image, ListGroup, Row, Spinner } from "react-bootstrap"
import { convertToThousand } from "../../utils/helpers"
import IconButton from "../../components/custom-button/IconButton"
import CustomIconButton from "../../components/custom-button/custom-icon-button"
import NewChefModal from "../../components/modals/chef/NewChefModal"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom";
import chefAvatar from '../../assets/images/cookemoji.png'
import { useDispatch } from "react-redux"
import api from "../../app/api"
import { toast } from "react-toastify"
import CreateChefMenu from "../../components/modals/chef/CreateChefMenu"
import UpdateChefProfileModal from "../../components/modals/chef/UpdateChefProfileModal"

export interface IChef {
    "staffId": string,
    "name": string,
    "gender": string,
    "email": string,
    "bio": string,
    "specialties": [
    ],
    "category": "",
    categoryName: "",
    "phoneNumber": number,
    "location": "",
    "state": "",
    "stateId": number,
    "profilePic": string,
    "menus": [],
    "isPasswordUpdated": boolean,
    "isActive": boolean,
    "createdAt": string,
    "updatedAt": string,
    "id": string,
}

export interface IMenu {
    "chef": {
        "name": string;
        "email": string;
        "id": string;
    },
    "title": string;
    "menuPic": string;
    "basePrice": number;
    "items": any[],
    "createdAt": string;
    "updatedAt": string;
    "id": string;
}

const ViewChefPage = () => {
    const [refData, setRefData] = useState(false)
    const [onCreateChef, setOnCreateChef] = useState(false);
    const [onUpdateChefProfile, setOnUpdateChefProfile] = useState(false)
    const params: any = useParams();
    const id = params?.id;
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [userEmail, setUserEmail] = useState("");
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [chef, setChef] = useState<IChef>()
    const [chefMenu, setChefMenu] = useState<IMenu[]>([])
    const infoCardData = [
        {
            id: '1',
            label: 'Total Menu',
            desc: 'Total menu for this chef',
            icon: 'bi bi-speedometer2',
            path: '/dashboard',
            count: chefMenu.length,
            isMoney: false
        },
        {
            id: '2',
            label: 'Bookings Completed',
            desc: 'No of completed bookings',
            icon: 'bi bi-person-workspace',
            path: '/admin',
            count: '-'
        },
        {
            id: '3',
            label: 'Upcoming bookings',
            desc: 'No upcoming bookings',
            icon: 'bi bi-backpack',
            path: '/chefs',
            count: '-'
        }

    ]

    const fetchChef = async () => {
        setLoading(true);
        try {
            const res = await api.get(`chef/${id}`);
            setChef(res?.data?.payload)
            console.log("chefs:", res.data);
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
    };

    const fetchChefMenu = async () => {
        // setLoading(true);
        try {
            const res = await api.get(`menu/getMenus?chefId=${id}`);
            setChefMenu(res?.data?.payload)
            // console.log("chefs:", res.data);
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
            toast.error('Unable to fetch chef menu!')
        }
    };

    useEffect(() => {
        fetchChef();
        fetchChefMenu()
    }, [refData])
    return (
        <div>
            {/* <div className="d-flex justify-content-end">
                <CustomIconButton className="text-light" title="Create Menu" />

            </div> */}
            <Row className="mt-4">

                {
                    infoCardData.map((card) => (<Col>
                        <Card>
                            <Card.Body>
                                <p className="fw-bold m-0 p-0">
                                    {
                                        card.label
                                    }
                                </p>
                                <p>
                                    {
                                        card.desc
                                    }
                                </p>
                                <h3>
                                    {
                                        card.isMoney ? convertToThousand(card.count) : card.count
                                    }
                                </h3>

                            </Card.Body>
                        </Card>
                    </Col>))
                }
            </Row>
            <div className="d-flex w-100 justify-content-end text-end">
                <a href="#">
                    View Booking history
                </a>
            </div>

            <Row className="mt-4">
                <Col>
                    <Card>
                        <Card.Body>
                            <div className="d-flex justify-content-between">
                                <p className="fw-bold m-0 p-0">
                                    Chef Profile
                                </p>

                                <Button onClick={() => setOnUpdateChefProfile(true)} variant="outline border">Update profile</Button>
                            </div>
                            {
                                loading ? <Spinner size="sm" /> :
                                    <div className="d-flex gap-4 mt-4 align-items-center">
                                        <div className="">
                                            {
                                                chef?.profilePic ? <Image height={250} className="rounded-3" src={chef.profilePic} /> :
                                                    <Image height={250} className="rounded-3" src={chefAvatar} />}

                                        </div>
                                        <div>
                                            <label>Full Name</label>
                                            <p>{chef?.name ?? '-'}<small>{` (${chef?.categoryName ?? '-'})`}</small></p>

                                            <label>Location</label>
                                            <p>{`${chef?.location},${chef?.state}`}</p>

                                            <label>Specialties</label>
                                            <p>Continental,International</p>

                                            <label>Phone Number</label>
                                            <p>{chef?.phoneNumber}</p>

                                            {/* <label>Chef Type</label>
                                    <p>08166064166</p> */}
                                        </div>
                                    </div>}

                        </Card.Body>
                    </Card>
                </Col>

                <Col>
                    <Card>
                        <Card.Body>
                            <div className="d-flex justify-content-between">
                                <p className="fw-bold m-0 p-0">
                                    Chef Menu
                                </p>

                                <Button onClick={() => setOnCreateChef(true)} variant="outline border">Add Menu</Button>
                            </div>
                            <div className="mt-4 gap-3">
                                {
                                    chefMenu.length > 0 ?
                                        chefMenu.map((menu) => (<div>
                                            <Card className="m-2"
                                                style={{
                                                    backgroundImage: menu?.menuPic
                                                        ? `url(${menu.menuPic})`
                                                        : "none",
                                                    backgroundSize: "cover",
                                                    minHeight: 250,
                                                    backgroundPosition: "center",
                                                }}>
                                                <Card.Header className="bg-dark text-light">
                                                    <div className="d-flex justify-content-between w-100">
                                                        <p className="p-0 m-0 text-light fw-bold">{menu?.title}</p>
                                                        <div className="table-icon">

                                                            <i className="bi bi-three-dots-vertical"></i>
                                                                <div className="content p-2 card border shadow position-absolute mr-2">
                                                                    <Card className="rounded rounded-3 border-0 shadow-lg text-left" style={{ minWidth: '10rem' }}>
                                                                        {
                                                                            <>
                                                                                <ListGroup variant="flush">
                                                                                    <ListGroup.Item
                                                                                        onClick={() => {
                                                                                            // history.push('/hospital/profile');
                                                                                            window.scrollTo(0, 0);
                                                                                        }}
                                                                                    >
                                                                                        Add procurement
                                                                                    </ListGroup.Item>
                                                                                </ListGroup>

                                                                                <ListGroup variant="flush">
                                                                                    <ListGroup.Item
                                                                                    >
                                                                                        Update
                                                                                    </ListGroup.Item>
                                                                                </ListGroup>

                                                                                <ListGroup variant="flush">
                                                                                    <ListGroup.Item
                                                                                    // onClick={handleLogout}
                                                                                    >Delete</ListGroup.Item>
                                                                                </ListGroup>
                                                                            </>
                                                                        }
                                                                    </Card>
                                                                </div>

                                                        </div>
                                                    </div>
                                                </Card.Header>
                                                <Card.Body
                                                >
                                                    {
                                                        menu.items.length>0?menu.items.map((groceries)=>( <Badge className="m-1 bg-info">
                                                        <div>
                                                            Onions
                                                        </div>
                                                        <div>{convertToThousand(5000)}</div>
                                                    </Badge>)) : <div><Badge className="p-2 rounded">No procurement details</Badge> </div>
                                                    }




                                                </Card.Body>

                                                <Card.Footer className="bg-dark">
                                                    <div className="d-flex justify-content-between  text-light w-100">
                                                        <p className="p-0 m-0 text-light">
                                                            {convertToThousand(20000)}/Person
                                                        </p>
                                                        <i className="bi bi-trash text-light"></i>
                                                    </div>
                                                </Card.Footer>
                                            </Card>
                                        </div>))
                                        : <div className="fw-bold">{!loading && `This chef has no menu`}</div>
                                }

                                {/* <Card className="m-2">
                                    <Card.Header>
                                        <div className="d-flex justify-content-between w-100">
                                            <p className="p-0 m-0 fw-bold">Smoky Jollof</p>
                                            <i className="bi bi-three-dots-vertical"></i>
                                        </div>
                                    </Card.Header>
                                    <Card.Body>
                                        <Badge className="m-1 bg-info">
                                            <div>
                                               Green pepper
                                            </div>
                                            <div>{convertToThousand(5000)}</div>
                                        </Badge>

                                        <Badge className="m-1 bg-info">
                                            <div>
                                                Goat meat
                                            </div>
                                            <div>{convertToThousand(5000)}</div>
                                        </Badge>




                                    </Card.Body>

                                    <Card.Footer>
                                      <div className="d-flex justify-content-between w-100">
                                            <p className="p-0 m-0">
                                                {convertToThousand(20000)}
                                            </p>
                                            <i className="bi bi-trash text-danger"></i>
                                        </div>
                                    </Card.Footer>
                                </Card> */}
                            </div>

                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <CreateChefMenu chefName={chef?.name || ''} chefId={chef?.id || ''} on={onCreateChef} off={() => setOnCreateChef(false)} onLogin={() => console.log('ok')} />
            <UpdateChefProfileModal chefName={chef?.name || ''} chefId={chef?.id || ''} on={onUpdateChefProfile} off={() => setOnUpdateChefProfile(false)} onLogin={() => console.log('ok')} />
        </div>
    )
}
export default ViewChefPage