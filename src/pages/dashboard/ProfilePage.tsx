// src/pages/Login.tsx
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useNavigation } from 'react-router-dom';
import { Form, Button, Card, Image, Navbar, Container, Nav, Modal, Row, Col, Spinner, Collapse, Badge } from 'react-bootstrap';
import '../../styles/home.scss';
import compnayLogo from '../assets/images/bc-kash-logo.png'; // Adjust the path as necessary
import CustomInput from '../../components/custom-input/CustormInput';
import CustomButton from '../../components/custom-button/custom-button';
import { ErrorMessage, Formik } from 'formik';
import * as Yup from 'yup';
import api from '../../app/api';
import { toast } from 'react-toastify';
import NavbarUnAuth from '../../components/bars/NavBarUnAuth';
import BottomNavbar from '../../components/bars/BottomNavbar';
import { IAd } from '../../interfaces/ad';
import ReusableInputs from '../../components/custom-input/ReusableInputs';
import LoginModal from '../../components/modals/auth/LoginModal';
import AuthenticationModal from '../../components/modals/auth/AuthModal';
import SignUpModal from '../../components/modals/auth/SignUpModal';
// import { IUser, IUserData } from '../../features/auth/authSlice';
import IconButton from '../../components/custom-button/IconButton';
import { persistor, RootState } from '../../store/store';
import moment from 'moment';
import UpdateProfileModal from '../../components/modals/auth/UpdateProfileModal';
import Footer from '../../components/bars/Footer';

export interface ILogin {
    email: string;
    password: string;
}

export interface ICategory {
    id: string;
    image: string;
    name: string;
    slug: string
}

export interface IHomeSlide {
    id: string;
    image: string;
    name: string;
    slug: string
}
const UserProfilePage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [recentlyPosted, setRecentlyPosted] = useState<IAd[]>([]);
    const [homeSlides, sethomeSlides] = useState<ICategory[]>([]);
    const [authModal, setAuthModal] = useState(false);
    const [loginModal, setLoginModal] = useState(false);
    const [signUpModal, setSignUpModal] = useState(false);
    const token = localStorage.getItem('userToken') || '';
    const userId = localStorage.getItem('userId') || '';
    const [userData, setUserData] = useState<any>();
    const [updateProfileModal,setUpdateProfileModal] = useState(false)
    // const userProfile = userData?userData: useSelector((user:RootState)=>user.auth.userProfile)
    const userProfile = userData

    const [openInfo, setOpenInfo] = useState(false);
    const handleLogout = () => {
        toast.success('ok')
        navigate('/');
        localStorage.clear();
        persistor.purge()
    }

    const handleGoToRoute = (path: string) => {
        if (!path) {
            toast.info('Still in development!, Only My Ads, Logout & Post Ad actions active for now')
        } else {
            navigate(path);
        }

    }

    const profileActivities = [
        {
            title: 'Marketing', subActions: [
                {
                    icon: 'bi bi-cart-check',
                    label: 'My Ads',
                    path: '/dashboard/ads',
                    count: 2
                },
                {
                    icon: 'bi bi-chat-heart',
                    label: 'Reviews',
                    path: '',
                    count: ''
                },
                {
                    icon: 'bi bi-bar-chart',
                    label: 'Sales',
                    path: '',
                    count: '',
                }
            ]
        },
        {
            title: 'Analytics', subActions: [
                {
                    icon: 'bi bi-graph-up-arrow',
                    label: 'Perfomance',
                    path: '',
                    count: ''
                },
                {
                    icon: 'bi bi-wallet',
                    label: 'Total Spent',
                    path: '',
                    count: ''
                },
                {
                    icon: 'bi bi-cash-stack',
                    label: 'Balance',
                    path: '',
                    count: ''
                }
            ]
        },
        {
            title: 'Follow up', subActions: [
                {
                    icon: 'bi bi-bell',
                    label: 'Notifications',
                    path: '',
                    count: ''
                },
                {
                    icon: 'bi bi-exclamation-triangle',
                    label: 'Warnings',
                    path: '',
                    count: ''
                }
            ]
        },
        {
            title: 'Prefferences', subActions: [
                {
                    icon: 'bi bi-person',
                    label: 'Profile',
                    path: '',
                    count: ''
                },
                {
                    icon: 'bi bi-box-arrow-left',
                    label: 'Logout',
                    path: '',
                    count: ''
                }
            ]
        }
    ]

    const initialValues = {
        email: '',
        password: '',
    };
    const validationSchema = Yup.object().shape({
        email: Yup.string()
            .email('Invalid email format')
            .required('Email is required'),
        password: Yup.string()
            .min(6, 'Password must be at least 6 characters')
            .required('Password is required'),
    });

    const handleSubmit = async (payload: ILogin) => {
        setLoading(true);
        // console.log({sending:payload});
        try {
            const res = await api.post('/staff/login', payload);
            navigate('/verify-login-otp', { state: { email: payload.email } });
            setLoading(false);
        } catch (error: any) {
            console.log({ errorHere: error })
            setLoading(false);
            if (error?.data?.message) {
                toast.error(error?.data?.message)
            } else {
                console.log({ seeError: error })
                toast.error(error?.message)
            }
        }
    };



    const handleProtectedClick = () => {
        if (!isLoggedIn) {
            setShowModal(true);
        } else {
            alert("Welcome back! You can now access this feature.");
        }
    };

    const handleLogin = () => {
        setLoginModal(true);
        setSignUpModal(false)
        setAuthModal(false);
    };

    const handleSignUp = () => {
        setLoginModal(false);
        setSignUpModal(true);
        setAuthModal(false);
    };


    const getHomeData = async () => {
        setLoading(true);
        try {
            const res = await api.get('home');
            setCategories(res?.data?.payload?.categories.reverse());
            setRecentlyPosted(res?.data?.payload?.recentlyPosted.reverse());
            // setHomeSlides8(res?.data?.payload?.categories.reverse());
            console.log({ seeRes: res });
            setLoading(false);
        } catch (error) {
            console.log({ seeErr: error })

        }

    }

    const getUserData = async () => {
        setLoading(true);
        try {
            const res = await api.get(`user/${userId}`, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });

            setUserData(res?.data?.payload);
            console.log({ seeRes: res });
        } catch (error) {
            console.log({ seeErr: error });
        } finally {
            setLoading(false);
        }
    };

    const handleCheckAuth = (path: string) => {
        console.log({ seePath: path });

        if (!token) {
            setAuthModal(true)
        } else {
            navigate(path)
        }
    }

    const loginUser = async (v: any) => {
        setLoading(true)
        try {

            const res = await api.post('auth/login', v);
            // localStorage.setItem("userToken",)
            console.log({ seeDat: res })
            setLoading(false)
        } catch (error) {
            setLoading(false)
        }
    }

    useEffect(() => {
        window.scrollTo(0, 0);
        getUserData()
        getHomeData()
    }, [navigate])

    return (
        <div>

            {/* Main Body */}
            <div className="bg-primary py-3 p-2 d-flex gap-2 align-items-center">
                <IconButton className="d-flex gap-2 bg-light text-dark" onClick={() => navigate(-1)} icon="bi bi-chevron-left" title="Back" />
                {/* <Button
          variant="fw-bold border bg-light"
          onClick={}
        >
          Go Back
        </Button> */}
            </div>

            <div className="text-center w-100 bg-info">
                <div>
                    <div className='d-flex justify-content-between p-2 align-items-center text-light'>

                        <p className='text-light fw-bold p-0 m-0'>Anouncement!</p>
                        <Button
                            onClick={() => setOpenInfo(!openInfo)}
                            aria-controls="collapse-content"
                            className='p-0 text-light'
                            variant="outline"
                        >
                            {openInfo ? "Hide" : "Show"}
                        </Button>

                    </div>

                    <Collapse in={openInfo}>
                        <div id="collapse-content" className="mt-3 p-3 border rounded bg-info text-light">
                            <p className='text-light p-0 m-0'>
                                Kindly update your profile to get the full experience.
                            </p>
                            <p className='text-light p-0 m-0'>
                                If you have any questions, dont hesitate to reach out to us!
                            </p>
                        </div>
                    </Collapse>
                </div>

            </div>

            {
                !loading &&
                <div>
                    <Container className="p-2 mt-3">
                        <h4 >Hello {userData?.profile.firstName}</h4>
                        <Row xs={2} sm={8} md={2} className="g-1">
                            {
                                loading &&
                                <Col md={12} className='text-center'>
                                    <Spinner />
                                </Col>

                            }
                            {profileActivities.map((activity, idx) => (
                                <Col key={idx}>
                                    <div className='mt-2'>
                                        <h5 className='p-0 m-0 text-primary'>{activity.title}</h5>
                                        <Card className='p-0 mt-2'>
                                            <ul className='m-0 p-0' style={{ listStyle: 'none' }}>
                                                {
                                                    activity.subActions.map((subAct) => (<li onClick={() => subAct.label == 'Logout' ? handleLogout() : handleGoToRoute(subAct.path)} role='button' className='d-flex p-3 justify-content-between border border-1'><div className='d-flex gap-2'><i className={subAct.icon}></i>{subAct.label}</div> <div>{subAct.count}</div></li>))
                                                }
                                            </ul>
                                        </Card>
                                    </div>

                                    {/* <ProductCategoryCard
                                        id={cat.id}
                                        title={cat.name}
                                        image={cat.image}
                                        onClick={() => alert(`Go to ${cat.slug}`)}
                                    /> */}
                                </Col>
                            ))}
                        </Row>
                        <hr />
                        <Card className='mt-3'>
                            <Card.Header className='fw-bold d-flex justify-content-between'>
                                <div className='text-primary'> Profile Information</div>
                                <Button onClick={()=>setUpdateProfileModal(true)} variant='outline border border-primary' className=''>
                                    <i className="bi bi-pencil-square m-2"></i>
                                    Update</Button>
                            </Card.Header>
                            <Card.Body className='border rounded'>

                                <Container>
                                    <Row>
                                        <Col><span className='fw-bold'><i className="bi bi-person-fill"></i></span>{userProfile?.profile.fullName}</Col>
                                        <Col><span className='fw-bold'><i className="bi bi-calendar-check-fill"></i></span>{moment(userProfile?.createdAt).format('dd-mm-y')}</Col>
                                        <Col><span className='fw-bold'><i className="bi bi-patch-exclamation"></i></span> <Badge className={`bg-${userProfile?.kyc.isKycCompleted ? 'success' : 'danger'}`}>{userProfile?.kyc.isKycCompleted ? 'Verified' : 'Unverified'}</Badge></Col>
                                    </Row>

                                    <Row className='mt-3'>

                                        <Col><span className='fw-bold'><i className="bi bi-house-fill"></i></span> {userProfile?.contact.address ?? '-'}</Col>
                                        <Col><span className='fw-bold'><i className="bi bi-envelope-fill"></i></span> {userProfile?.contact.email}</Col>
                                        <Col><span className='fw-bold'><i className="bi bi-telephone-fill"></i></span>{userProfile?.contact.phoneNumber}</Col>
                                    </Row>
                                </Container>
                            </Card.Body>
                        </Card>

                        <Card className='mt-3'>
                            <Card.Header className='fw-bold d-flex justify-content-between'>
                                <div className='text-primary'> Business Information</div>
                                <Button disabled variant='outline border border-primary' className=''>
                                    <i className="bi bi-pencil-square m-2"></i>
                                    Update</Button>
                            </Card.Header>
                            <Card.Body className='border rounded'>

                                <Container>
                                    <Row>
                                        <Col>
                                            <p className='m-0 p-0 fw-bold'>Store/Business Name</p>
                                            <p>-</p>
                                        </Col>

                                        <Col>
                                            <p className='m-0 p-0 fw-bold'>Reg No</p>
                                            <p>-</p>
                                        </Col>


                                    </Row>

                                    <Row className='mt-3'>
                                        <Col>
                                            <p className='m-0 p-0 fw-bold'>Office Address</p>
                                            <p>-</p>
                                        </Col>

                                        <Col>
                                            <p className='m-0 p-0 fw-bold'>Status</p>
                                            <Badge className='bg-warning'>Pending</Badge>
                                        </Col>

                                    </Row>
                                </Container>
                            </Card.Body>
                        </Card>

                    </Container>

                </div>}
            <Row className='mt-4'>
                {
                    loading &&
                    <Col md={12} className='text-center'>
                        <Spinner />
                    </Col>

                }
            </Row>
            <Footer gotoProfile={()=>console.log('')} gotToPostAd={()=>console.log('')}/>

            <BottomNavbar checkAuthStatus={(path: string) => handleCheckAuth(path)} />

            {/* Login/Signup Modal */}
            <UpdateProfileModal
            on={updateProfileModal}
            off={()=>setUpdateProfileModal(false)}
            />
            <AuthenticationModal handleLogin={handleLogin} handleSignUp={handleSignUp} on={authModal} off={() => setAuthModal(false)} />
            <LoginModal on={loginModal} off={() => setLoginModal(false)} onSignUp={handleSignUp} />
            <SignUpModal on={signUpModal} off={() => setSignUpModal(false)} onLogin={handleLogin} />
        </div>
    );
};

export default UserProfilePage;