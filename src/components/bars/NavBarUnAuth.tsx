import { useState } from "react";
import { Button, Container, Image, Nav, Navbar, Collapse } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import ogaselaLog from "../../assets/images/ogasela-logo.svg";
import CustomButton from "../custom-button/custom-button";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import compLogo from '../../assets/images/rentAChefAdminLogo.png'
import { useNavigate } from "react-router-dom";

interface ITopBar {
    gotoProfile: () => void;
    gotToPostAd: () => void;
}
const NavbarUnAuth: React.FC<ITopBar> = ({ gotoProfile, gotToPostAd }) => {
    const token = localStorage.getItem('userToken') as string
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [open, setOpen] = useState(false);
    const userProfile = useSelector((user: RootState) => user.auth.userProfile)
    const donationUrl = process.env.REACT_APP_DONATION;

    const navigate = useNavigate()

    return (
        <Navbar bg="light" expand="sm" className="shadow-sm d-flex flex-column px-3 w-100 bg-danger ">
            <Container className="d-flex p-0 align-items-center">
                {/* Brand / Logo */}
                {/* <span className="fw-bold align-items-center">Admin Portal</span> */}
                <Button variant="outline border" onClick={() => navigate(-1)}>Go Back</Button>

                <div className="">
                    <p className="p-0 m-0 fw-bold">{userProfile?.fullName}</p>
                    <p className="p-0 m-0">Admin</p>


                    {/* <a onClick={gotToPostAd} href="#">
                        Welcome
                    </a> */}
                    {/* {userProfile?.profile.profilePicUrl && token?<Image role="button" onClick={gotoProfile} src={userProfile?.profile.profilePicUrl} height={30} style={{borderRadius:30}}/>:<i onClick={gotoProfile} className="bi bi-person-circle fs-2 text-primary" role="button"></i>} */}

                    {/* <CustomButton
                title=""
                /> */}
                </div>




                {/* <button
                    className="btn border-0 d-sm-none"
                    onClick={() => setOpen(!open)}
                    aria-controls="basic-navbar-nav"
                    aria-expanded={open}
                >
                    <i className="bi bi-list fs-3"></i>
                </button> */}



            </Container>
        </Navbar>
    );
};

export default NavbarUnAuth;