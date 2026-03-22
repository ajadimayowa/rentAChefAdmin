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
import EditSpecialMenu from "../../components/modals/menu/EditSpecialMenu"

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

const ViewMenuPage = () => {
    const [refData, setRefData] = useState(false)
    const [onAddProcurement, setOnAddProcuremt] = useState(false);
    const [onUpdateChefProfile, setOnUpdateChefProfile] = useState(false)
    const [onEditSpecialMenu, setOnEditSpecialMenu] = useState(false)
    const params: any = useParams();
    const id = params?.id;
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [userEmail, setUserEmail] = useState("");
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [menuInfo, setMenuInfo] = useState<any>()
    const [chefMenu, setChefMenu] = useState<IMenu[]>([])
    const [reviews, setReviews] = useState<any[]>([])
    const [reviewsMeta, setReviewsMeta] = useState<{ average?: number; total?: number }>({})
    const [loadingReviews, setLoadingReviews] = useState(false)
    const infoCardData = [
        {
            id: '1',
            label: 'All Orders',
            desc: 'All orders of this menu',
            icon: 'bi bi-speedometer2',
            path: '/dashboard',
            count: chefMenu.length,
            isMoney: false
        },
        {
            id: '2',
            label: 'Reviews',
            desc: 'No of people who has reviewed',
            icon: 'bi bi-person-workspace',
            path: '/admin',
            count: '-'
        }

    ]

    const fetchMenuInfo = async () => {
        setLoading(true);
        try {
            const res = await api.get(`specialMenu/${id}`);
            setMenuInfo(res?.data?.payload)
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
            toast.error('Invalid Credentials')
        }
    };

    const fetchReviews = async () => {
        if (!id) return;
        setLoadingReviews(true);
        try {
            // backend route: GET /specialmenu/:menuId/ratings
            const res = await api.get(`specialmenu/${id}/ratings`);
            const payload = res?.data?.payload;
            setReviews(payload?.items || []);
            setReviewsMeta({ average: payload?.average, total: payload?.total });
        } catch (error) {
            console.error('Failed to fetch reviews', error);
        } finally {
            setLoadingReviews(false);
        }
    }

    // const fetchMenuInfo = async () => {
    //     // setLoading(true);
    //     try {
    //         const res = await api.get(`menu/${id}`);
    //         setChefMenu(res?.data?.payload)
    //         // console.log("chefs:", res.data);
    //         // loadStates()
    //         // localStorage.setItem('userToken',res?.data?.token);
    //         // localStorage.setItem('userId',res?.data?.payload?.id);
    //         // dispatch(setUserData(res?.data?.payload))
    //         // navigate('/dashboard')
    //         // toast.success('Login Successful!')
    //         // setUserEmail(values.email);
    //         setLoading(false);
    //         // setStep(2); // proceed to OTP verification
    //     } catch (error) {
    //         console.error(error);
    //         setLoading(false);
    //         toast.error('Unable to fetch chef menu!')
    //     }
    // };

    useEffect(() => {
        fetchMenuInfo()
        fetchReviews()
    }, [refData, id])
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
            {/* <div className="d-flex w-100 gap-3 justify-content-end text-end">
                 <a href="/dashboard/menus">
                    Go to menu list
                </a>
                <a href="#">
                    View Booking history
                </a>
            </div> */}

            <Row className="mt-4">
                <Col>
                    <Card>
                        <Card.Body>
                            <div className="d-flex justify-content-between">
                                <p className="fw-bold m-0 p-0">
                                    Special Menu Description
                                </p>

                                <Button onClick={() => setOnEditSpecialMenu(true)} variant="outline border">Update</Button>
                            </div>
                            {
                                loading ? <Spinner size="sm" /> :
                                    <div className="d-flex gap-4 mt-4 align-items-center">
                                        <div className="">
                                            {
                                                menuInfo?.image ? <Image height={200} width={250}  className="rounded-3" src={menuInfo?.image} /> :
                                                    <Image height={200} className="rounded-3" src={chefAvatar} />}

                                        </div>
                                        <div>
                                            <label>Title</label>
                                            <p>{menuInfo?.title ?? '-'}</p>

                                            <label>Base price</label>
                                            <p>{convertToThousand(menuInfo?.price)}</p>

                                            <label>Min Guests</label>
                                            <p>{menuInfo?.minimumGuests ?? '-'}</p>

                                            <label>Number of dish</label>
                                            <p>{menuInfo?.numberOfDishes ?? '-'}</p>


                                            <label>Description</label>
                                            <p>{menuInfo?.description}</p>

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
                                    Review comments
                                </p>

                                    {/* <Button onClick={() => setOnAddProcuremt(true)} variant="outline border">Add Item</Button> */}
                            </div>
                                {
                                    loadingReviews ? (
                                        <Spinner />
                                    ) : (
                                        <div className="mt-3">
                                            <p className="mb-1"><strong>Average:</strong> {reviewsMeta?.average ? Number(reviewsMeta.average).toFixed(1) : '-'} <small className="text-muted">({reviewsMeta?.total || 0} reviews)</small></p>
                                            <ListGroup>
                                                {reviews?.length > 0 ? (
                                                    reviews.map((r: any, idx: number) => (
                                                        <ListGroup.Item key={idx} className="d-flex gap-3 align-items-start">
                                                            <Image src={r?.userId?.profilePic || chefAvatar} width={40} height={40} rounded />
                                                            <div>
                                                                <div className="d-flex gap-2 align-items-center">
                                                                    <strong>{r?.userId?.firstName || r?.userId?.fullName || 'User'}</strong>
                                                                    <Badge bg="secondary">{r?.rating || '-'}</Badge>
                                                                </div>
                                                                <div className="small text-muted">{new Date(r?.createdAt).toLocaleString()}</div>
                                                                <p className="mt-2 mb-0">{r?.review || ''}</p>
                                                            </div>
                                                        </ListGroup.Item>
                                                    ))
                                                ) : (
                                                    <ListGroup.Item className="text-center">No reviews yet</ListGroup.Item>
                                                )}
                                            </ListGroup>
                                        </div>
                                    )
                                }
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <EditSpecialMenu menu={menuInfo} on={onEditSpecialMenu} off={() => setOnEditSpecialMenu(false)} onSuccess={() => { setOnEditSpecialMenu(false); setRefData(!refData); }} />
        </div>
    )
}
export default ViewMenuPage