import React from "react";
import { Modal } from "react-bootstrap";
import CustomIconButton from "../../custom-button/custom-icon-button";
interface IAuthModal {
    on: boolean;
    off: () => void;
    handleLogin: () => void;
    handleSignUp: () => void;
}
const AuthenticationModal: React.FC<IAuthModal> = ({ on, off, handleLogin, handleSignUp }) => {

    return (
        <Modal show={on} onHide={off} centered>
            <Modal.Header closeButton>
                <Modal.Title>Login / Sign Up</Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-center">
                <p>Kindly Register/Login to continue.</p>
                
                <div className="w-100"> 
                    <CustomIconButton className="w-100" title="Login" onClick={handleLogin} />
                </div>
                <div className="w-100 mt-2">
<CustomIconButton variant="outline" className="w-100 outline text-dark border border-primary" title="Sign Up" onClick={handleSignUp} />
                </div>
                
            </Modal.Body>
        </Modal>
    )
} 
export default AuthenticationModal