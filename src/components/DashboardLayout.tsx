// src/layouts/DashboardLayout.tsx
import React, { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import NavbarUnAuth from "./bars/NavBarUnAuth";
import BottomNavbar from "./bars/BottomNavbar";
import AuthenticationModal from "./modals/auth/AuthModal";
import LoginModal from "./modals/auth/LoginModal";
import SignUpModal from "./modals/auth/SignUpModal";
import { Button, Image, NavItem } from "react-bootstrap";
import compLogo from '../assets/images/rentAChefLogoLight.png'

const DashboardLayout: React.FC = () => {
     const [authModal, setAuthModal] = useState(false);
    const [loginModal, setLoginModal] = useState(false);
    const [signUpModal, setSignUpModal] = useState(false);
    const navigate = useNavigate();
    const currentPath = useLocation().pathname

    const guides = [
        {
            id:'1',
            label:'Dashboard',
            icon:'bi bi-speedometer2',
            path:'/dashboard'
        },
        {
            id:'2',
            label:'Admins',
            icon:'bi bi-person-workspace',
            path:'/dashboard/admins'
        },
        {
            id:'3',
            label:'Chefs',
            icon:'bi bi-backpack',
            path:'/dashboard/chefs'
        },
        {
            id:'4',
            label:'Customers',
            icon:'bi bi-person-add',
            path:'/dashboard/customers'
        },
        {
            id:'5',
            label:'Settings',
            icon:'bi bi-gear',
            path:'/dashboard/settings'
        },
    ]


    

    const handleCheckAuth = (path: string) => {
        console.log({ seePath: path });
        const token = localStorage.getItem('userToken') || '';
        if (!token) {
            setAuthModal(true)
        } else {
            navigate(path)
        }
    }

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
    return (
        <>
            <div className="dashboard-layout" >
                {/* Example: add navbar, sidebar, etc. */}
                <div className="d-flex dashboard-content ">
                    <div className="bg-primary w-25 text-center">
                        <Image src={compLogo} height={150} /> 
                        <ul className="w-100 text-light m-0 p-0">
                            {
                                guides.map((link)=>(<li onClick={()=>navigate(link.path)} className={`d-flex gap-3 p-3 ${link.path==currentPath?'bg-light text-dark':''}`}><i className={link.icon}></i><span role="button" className="">{link.label}</span></li>))
                            }
                            <li role="button" onClick={()=>{localStorage.clear(); navigate('/')}} className="d-flex gap-3 p-3 mt-5"><i className="bi bi-box-arrow-left"></i> Logout</li>
                        </ul>
                    </div>
                    {/* Render nested routes */}
                   <div className="w-75" style={{overflow:'scroll',height:'100vh'}}>
                    <NavbarUnAuth gotToPostAd={()=>console.log('ok')} gotoProfile={()=>console.log('ok')}/>
                    <div className="p-4">
                         <Outlet />
                    </div>
                   </div>
                </div>
            </div>

            {/* <BottomNavbar checkAuthStatus={(path: string) => handleCheckAuth(path)} /> */}

            {/* Login/Signup Modal */}
            <AuthenticationModal handleLogin={handleLogin} handleSignUp={handleSignUp} on={authModal} off={() => setAuthModal(false)} />
            <LoginModal on={loginModal} off={() => setLoginModal(false)} onSignUp={handleSignUp} />
            <SignUpModal on={signUpModal} off={() => setSignUpModal(false)} onLogin={handleLogin} />
        </>);
};

export default DashboardLayout;
