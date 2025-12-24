import { Badge, Button, Card, Col, Image, Row } from "react-bootstrap"
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

export interface IChef {
        "staffId": string,
        "name": string,
        "gender": string,
        "email": string,
        "bio": string,
        "specialties": [
        ],
        "category": "",
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
const ViewChefPage = () => {
    const [onCreateChef, setOnCreateChef] = useState(false)
    const params: any = useParams();
    const id = params?.id;
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [userEmail, setUserEmail] = useState("");
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [chef,setChef] = useState<IChef>()
    const infoCardData = [
        {
            id: '1',
            label: 'Total Menu',
            desc: 'Total revenue',
            icon: 'bi bi-speedometer2',
            path: '/dashboard',
            count: '5',
            isMoney: true
        },
        {
            id: '2',
            label: 'Bookings Completed',
            desc: 'No of active customers',
            icon: 'bi bi-person-workspace',
            path: '/admin',
            count: '3'
        },
        {
            id: '3',
            label: 'Bookings Missed',
            desc: 'No of active chefs',
            icon: 'bi bi-backpack',
            path: '/chefs',
            count: '2'
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

    useEffect(()=>{
        fetchChef()
    },[])
    return (
        <div>
            <div className="d-flex justify-content-end">
                <CustomIconButton onClick={() => setOnCreateChef(true)} className="text-light" title="Create Menu" />

            </div>
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

                                <Button variant="outline border">Update profile</Button>
                            </div>
                            <div className="d-flex gap-4 mt-4 align-items-center">
                                <div className="">
                                    <Image  height={250} className="rounded-3" src={chefAvatar} />

                                </div>
                                <div>
                                    <label>Full Name</label>
                                    <p>{chef?.name}<small>{` (${chef?.category})`}</small></p>

                                    <label>Location</label>
                                    <p>{`${chef?.location},${chef?.state}`}</p>

                                    <label>Specialties</label>
                                    <p>Continental,International</p>

                                    <label>Phone Number</label>
                                    <p>{chef?.phoneNumber}</p>

                                    {/* <label>Chef Type</label>
                                    <p>08166064166</p> */}
                                </div>
                            </div>

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

                                <Button variant="outline border">Add Menu</Button>
                            </div>
                            <div className="mt-4 gap-3">
                                <Card className="m-2">
                                    <Card.Header>
                                        <div className="d-flex justify-content-between w-100">
                                            <p className="p-0 m-0 fw-bold">Calabar Special</p>
                                            <i className="bi bi-three-dots-vertical"></i>
                                        </div>
                                    </Card.Header>
                                    <Card.Body>
                                        <Badge className="m-1 bg-info">
                                            <div>
                                                Onions
                                            </div>
                                            <div>{convertToThousand(5000)}</div>
                                        </Badge>

                                        <Badge className="m-1 bg-info">
                                            <div>
                                                Meat
                                            </div>
                                            <div>{convertToThousand(1500)}</div>
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
                                </Card>

                                <Card className="m-2">
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
                                </Card>
                            </div>

                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <NewChefModal on={onCreateChef} off={() => setOnCreateChef(false)} onLogin={() => console.log('ok')} />
        </div>
    )
}
export default ViewChefPage