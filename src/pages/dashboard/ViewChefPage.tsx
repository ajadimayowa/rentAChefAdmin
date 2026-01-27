import { Badge, Button, Card, Col, Image, ListGroup, Row, Spinner } from "react-bootstrap"
import { convertToThousand } from "../../utils/helpers"
import IconButton from "../../components/custom-button/IconButton"
import CustomIconButton from "../../components/custom-button/custom-icon-button"
import NewChefModal from "../../components/modals/chef/NewChefModal"
import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom";
import chefAvatar from '../../assets/images/cookemoji.png'
import { useDispatch } from "react-redux"
import api from "../../app/api"
import { toast } from "react-toastify"
import CreateChefMenu from "../../components/modals/chef/CreateChefMenu"
import UpdateChefProfileModal from "../../components/modals/chef/UpdateChefProfileModal"

export interface IService {
    name: string,
    id: string
}
export interface IChef {
    "staffId": string,
    "name": string,
    "gender": string,
    "email": string,
    "bio": string,
    "specialties": [
    ],
    "category": "",
    "categoryName": "",
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
    "servicesOffered": IService[],
    "id": string,
}

interface IProcurement {
    title: string;
    description?: string;
    price: number;
}
export interface IMenu {
    "chefId": {
        "name": "Grace Alison",
        "id": "697615d71e3664e0d76c85d4"
    },
    "month": "2026-01",
    "weeks": [
        {
            "weekNumber": 1,
            "days": [
                {
                    "day": "Monday",
                    "breakfast": "Akara & Pap",
                    "lunch": "Jollof Rice",
                    "dinner": "Egusi Soup"
                },
                {
                    "day": "Tuesday",
                    "breakfast": "Tea & Bread",
                    "lunch": "Fried Rice",
                    "dinner": "Yam Porridge"
                },
                {
                    "day": "Wednesday",
                    "breakfast": "Yam and Egg",
                    "lunch": "Eba & Fufu",
                    "dinner": "Yam Porridge"
                },
                {
                    "day": "Thursday",
                    "breakfast": "Yam and Egg",
                    "lunch": "Eba & Fufu",
                    "dinner": "Yam Porridge"
                },
                {
                    "day": "Friday",
                    "breakfast": "Yam and Egg",
                    "lunch": "Eba & Fufu",
                    "dinner": "Yam Porridge"
                },
                {
                    "day": "Saturday",
                    "breakfast": "Yam and Egg",
                    "lunch": "Eba & Fufu",
                    "dinner": "Yam Porridge"
                },
                {
                    "day": "Sunday",
                    "breakfast": "Yam and Egg",
                    "lunch": "Eba & Fufu",
                    "dinner": "Yam Porridge"
                }
            ]
        }
    ],
    "menuPic": "https://rentachefdev.s3.eu-north-1.amazonaws.com/images/profile-pictures/1769349266741-mixkit-fresh-sliced-fruit-placed-on-a-table-10419-hd-ready.mp4",
    "createdBy": "admin",
    "approved": false,
    "procurement": IProcurement[],
    "createdAt": "2026-01-25T13:54:32.409Z",
    "updatedAt": "2026-01-25T13:54:32.409Z",
    "id": "69762098acf8908a7d4df963"
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
            count: chefMenu?.length,
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
            const res = await api.get(`menu/getMenus?chefId=${id}&limit=3`);
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
            <div className="d-flex w-100 gap-3 justify-content-end text-end">
                <a href="/dashboard/menus">
                    Go to menu list
                </a>
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
                                                chef?.profilePic ? <Image height={250} width={300} className="rounded-3" src={chef.profilePic} /> :
                                                    <Image height={250} width={300} className="rounded-3" src={chefAvatar} />}

                                        </div>
                                        <div>
                                            <label>Full Name</label>
                                            <p>{chef?.name ?? '-'}<small>{` (${chef?.categoryName ?? '-'})`}</small></p>

                                            <label>Location</label>
                                            <p>{`${chef?.location},${chef?.state}`}</p>

                                            <label>Specialties</label>
                                            {chef?.specialties?.map((spe) => <p>{spe}</p>)}

                                            {/* <label>Chef Type</label>
                                    <p>08166064166</p> */}
                                        </div>

                                        <div>
<label>Phone Number</label>
                                            <p>{chef?.phoneNumber}</p>

                                            <label>Services</label>
                                            {chef?.servicesOffered?.map((spe) => <p className="p-0 m-0">{spe?.name}</p>)}
                                        </div>
                                    </div>}

                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            
            
            <Row className="mt-4">
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
                                    chefMenu?.length > 0 ?
                                        chefMenu.map((menu, key) => (
                                            <div key={key}>
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
                                                            <p className="p-0 m-0 text-light fw-bold">{menu?.month}</p>
                                                            <div className="table-icon">
                                                                <i className="bi bi-three-dots-vertical"></i>
                                                                <div className="content p-2 card border shadow position-absolute mr-4">
                                                                    <Card className="rounded rounded-3 border-0 shadow-lg text-left" style={{ minWidth: '10rem' }}>
                                                                        {
                                                                            <>
                                                                                <ListGroup variant="flush">
                                                                                    <ListGroup.Item
                                                                                    >
                                                                                       + Procurements
                                                                                    </ListGroup.Item>
                                                                                      <ListGroup.Item
                                                                                    >
                                                                                        Update

                                                                                    </ListGroup.Item>
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
                                                            menu.weeks.map((week) => (
                                                                <Card>
                                                                    <Card.Header>
                                                                        {
                                                                            `Week ${week?.weekNumber}`
                                                                        }
                                                                    </Card.Header>
                                                                    <Card.Body>
                                                                        <Row>
                                                                            {
                                                                            week?.days.map((days) => (
                                                                                <Col>
                                                                                <div className="m-2">
                                                                                    <p className="fw-bold m-0 p-0">{days?.day}</p>
                                                                                    <table className="table table-striped">
                                                                                        <thead>
                                                                                            <tr>
                                                                                                <th scope="col">Breakfast</th>
                                                                                                <th scope="col">Lunch</th>
                                                                                                <th scope="col">Dinner</th>
                                                                                            </tr>
                                                                                        </thead>
                                                                                        <tbody>
                                                                                            <tr>
                                                                                                <td>{days?.breakfast}</td>
                                                                                                <td>{days?.lunch}</td>
                                                                                                <td>{days?.dinner}</td>
                                                                                            </tr>
                                                                                        </tbody>
                                                                                    </table>
                                                                                </div>
                                                                                </Col>
                                                                            ))
                                                                        }

                                                                        </Row>
                                                                    </Card.Body>

                                                                </Card>
                                                            ))
                                                        }
                                                        <p className="fw-bold mt-3">Procurements</p>
                                                        {
                                                            menu.procurement?.length > 0 ? menu.procurement.map((groceries) => (<Badge className="m-1 bg-warning text-dark">
                                                                <div>
                                                                    {
                                                                        groceries?.title
                                                                    }
                                                                </div>
                                                                <div>{convertToThousand(groceries?.price)}</div>
                                                            </Badge>)) : <div className="d-flex justify-content-between"><Badge className="p-2 rounded">No procurement details</Badge></div>
                                                        }




                                                    </Card.Body>

                                                   
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