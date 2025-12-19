import React, { useEffect, useState } from "react";
import { Carousel, Container, Row, Col, Card, Badge, Spinner, Collapse, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../app/api";
import BottomNavbar from "../../components/bars/BottomNavbar";
import AuthenticationModal from "../../components/modals/auth/AuthModal";
import LoginModal from "../../components/modals/auth/LoginModal";
import SignUpModal from "../../components/modals/auth/SignUpModal";
import NavbarUnAuth from "../../components/bars/NavBarUnAuth";
import { IAd } from "../../interfaces/ad";
import { convertToThousand } from "../../utils/helpers";
import moment from "moment";
import IconButton from "../../components/custom-button/IconButton";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import PaystackPayment from "../../components/Stack";
import { toast } from "react-toastify";

const ViewAdPage = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [adInfo, setAdInfo] = useState<IAd>();
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [showCont, setShowCont] = useState(true);
    const navigate = useNavigate();
    const [openInfo, setOpenInfo] = useState(false);

    const [authModal, setAuthModal] = useState(false);
    const [loginModal, setLoginModal] = useState(false);
    const [signUpModal, setSignUpModal] = useState(false);
    const user = useSelector((user: RootState) => user.auth.userProfile)

    const handleCheckAuth = (path: string) => {
        const token = localStorage.getItem("userToken") || "";
        if (!token) {
            setAuthModal(true);
        } else {
            navigate(path);
        }
    };

    const handleLogin = () => {
        setLoginModal(true);
        setSignUpModal(false);
        setAuthModal(false);
    };

    const handlePaymentUodate = async (refNum: any) => {
        setLoading(true);
        try {
            const res = await api.post(`ad/update-payment`, {
                adId: id,
                reference: refNum?.reference
            });
            toast.success(res?.data?.message || 'Payment completed, awaiting review!');
            setLoading(false);
            navigate('/dashboard/ads')
        } catch (error) {
            console.log({ seeErr: error });
        } finally {
            setLoading(false);
        }

    }

    const handleSignUp = () => {
        setLoginModal(false);
        setSignUpModal(true);
        setAuthModal(false);
    };

    const getAdInfo = async () => {
        setLoading(true);
        try {
            const res = await api.get(`ad/${id}`);
            setAdInfo(res?.data?.data);
        } catch (error) {
            console.log({ seeErr: error });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        getAdInfo();
    }, [navigate]);



    return (
        <>
            <NavbarUnAuth
                gotoProfile={() => handleCheckAuth("/dashboard/profile")}
                gotToPostAd={() => handleCheckAuth("/dashboard/post-ad")}
            />
            <div className="bg-primary py-5 p-2 d-flex gap-2 align-items-center">
                <IconButton className="d-flex gap-2 bg-light text-dark" onClick={() => navigate(-1)} icon="bi bi-chevron-left" title="Back" />
                {/* <Button
          variant="fw-bold border bg-light"
          onClick={}
        >
          Go Back
        </Button> */}
            </div>
            <div className="bg-danger">
                <div className='d-flex justify-content-between p-2 align-items-center text-light'>
                    <p className='text-light fw-bold p-0 m-0'>Warning!</p>
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
                    <div id="collapse-content" className="mt-3 p-3 border rounded bg-danger text-light">
                        <p className='text-light p-0 m-0'>
                            Please stay safe when buying from ogasela.
                        </p>
                        <p className='text-light p-0 m-0'>
                            Verify the genuines before sending money!
                        </p>
                    </div>
                </Collapse>
            </div>
            <Container className="my-4">
                {loading ? (
                    <div className="text-center my-5">
                        <Spinner animation="border" />
                    </div>
                ) : (
                    <>
                        {/* === Main Carousel === */}


                        <Carousel
                            activeIndex={selectedIndex}
                            onSelect={(selected) => setSelectedIndex(selected)}
                            interval={null}
                            fade
                        >
                            {adInfo?.images.map((img, index) => (
                                <Carousel.Item key={index}>
                                    <img
                                        className="d-block w-100 rounded-3"
                                        src={img}
                                        alt={`Slide ${index + 1}`}
                                        style={{
                                            height: "400px",
                                            objectFit: "contain",
                                            backgroundColor: "#f8f9fa", // light gray background to fill empty spaces
                                        }}
                                    />
                                </Carousel.Item>
                            ))}
                        </Carousel>

                        {/* === Thumbnail List === */}
                        <div className="d-flex justify-content-center flex-wrap gap-2 mt-3">
                            {adInfo?.images.map((img, index) => (
                                <div
                                    key={index}
                                    onClick={() => setSelectedIndex(index)}
                                    style={{
                                        width: 90,
                                        height: 70,
                                        borderRadius: "8px",
                                        overflow: "hidden",
                                        cursor: "pointer",
                                        border:
                                            selectedIndex === index
                                                ? "3px solid #0d6efd"
                                                : "2px solid #ccc",
                                        transition: "0.3s",
                                    }}
                                >
                                    <img
                                        src={img}
                                        alt={`Thumbnail ${index + 1}`}
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="d-flex text-center w-100 justify-content-center mt-5">

                            {
                                user.fullName == adInfo?.sellerName &&
                                <PaystackPayment

                                    email="customer@email.com"
                                    amount={adInfo.promotionType.price}
                                    onSuccess={(ref) => handlePaymentUodate(ref)}
                                    onClose={() => console.log("Payment closed")}
                                />
                            }
                        </div>
                        {/* === Ad Info Section === */}
                        <div className="mt-3">
                            <div className="d-flex justify-content-between align-items-center">

                                <p className="text-muted mb-0">
                                    {/* {ad.location} • {ad.views} */}
                                </p>
                                {
                                    adInfo && adInfo.promotionType.paymentCompleted &&
                                    <Badge bg="warning" text="dark">
                                        Promoted
                                    </Badge>
                                }
                            </div>
                            <p className="text-secondary mt-1">
                                {adInfo?.views.toLocaleString()} views
                            </p>
                            <h4 className="fw-bold">{adInfo?.title}</h4>
                        </div>

                        {/* === Quick Info Cards === */}
                        <Row className="my-3">
                            <Col xs={6} md={3}>
                                <Card className="p-3 text-center shadow-sm">
                                    <Card.Title className="fs-6">{adInfo?.condition}</Card.Title>
                                    <small className="text-muted">Condition</small>
                                </Card>
                            </Col>
                            <Col xs={6} md={3}>
                                <Card className="p-3 text-center shadow-sm">
                                    <Card.Title className="fs-6">{convertToThousand(adInfo?.price)}</Card.Title>
                                    <small className="text-muted">Price</small>
                                </Card>
                            </Col>
                        </Row>
                        <h4 className="fw-bold">Description</h4>
                        <p>{adInfo?.description}</p>
                        {/* === Vehicle Details === */}
                        <Card className="p-4 shadow-sm border-0">
                            <h5 className="fw-bold mb-3">Seller Information</h5>
                            <Row>
                                <Col md={4}>
                                    <p className="text-capitalize">
                                        <strong >Name:</strong> {adInfo?.sellerName}
                                    </p>
                                </Col>
                                <Col md={4}>
                                    <p>
                                        <strong>Num of viewers:</strong> {adInfo?.views}
                                    </p>
                                </Col>
                                <Col md={4}>
                                    <p>
                                        <strong>Date Posted:</strong> {moment(adInfo?.createdAt).format('ddd/MMM/YYYY : HH:MM A')}
                                    </p>
                                </Col>
                                <Col md={4}>
                                    <p>
                                        <strong role="button" className="p-2 rounded bg-info text-light" onClick={() => setShowCont(!showCont)}>Show Contact:</strong> {showCont ? '+234********' : `+234${adInfo?.seller?.contact?.phoneNumber}`}
                                    </p>
                                </Col>
                                <Col md={4}>
                                    <p>
                                        <strong>Address:</strong> {showCont ? 'locat********' : adInfo?.location.address}
                                    </p>
                                </Col>

                                <Col md={4} >
                                    <Link to={'https://wa.me/message/YLK4QJBSIGZ5M1'}>
                                        <div className="d-flex gap-2 text-primary" role="button">
                                            <i className="bi bi-whatsapp"></i>
                                            <p className="text-primary">
                                                <strong>Whatsapp Message</strong>
                                            </p>
                                        </div>
                                    </Link>


                                </Col>

                            </Row>
                        </Card>
                    </>
                )}


            </Container>

            {/* === Bottom Navbar & Auth Modals === */}
            <BottomNavbar checkAuthStatus={(path: string) => handleCheckAuth(path)} />
            <AuthenticationModal
                handleLogin={handleLogin}
                handleSignUp={handleSignUp}
                on={authModal}
                off={() => setAuthModal(false)}
            />
            <LoginModal
                on={loginModal}
                off={() => setLoginModal(false)}
                onSignUp={handleSignUp}
            />
            <SignUpModal
                on={signUpModal}
                off={() => setSignUpModal(false)}
                onLogin={handleLogin}
            />
        </>
    );
};

export default ViewAdPage;
