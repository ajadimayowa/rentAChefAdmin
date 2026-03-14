import { Badge, Col, Container, Image, Row } from "react-bootstrap";
import './success.css';
import ownerImg from '../../assets/images/rentAChefOwnerWeb.png';
import androidIcon from '../../assets/images/android-icon.png';
import adminLogo from '../../assets/images/rentAChefAdminLogo.png';
import { ErrorMessage, Formik } from "formik";
import { ReusableForm } from "../../components/forms/ReusableForm";
import CustomInput from "../../components/custom-input/CustormInput";
import * as Yup from "yup";
import ReusableInputs from "../../components/custom-input/ReusableInputs";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import api from "../../app/api";
import { toast } from "react-toastify";
import { setUserData } from "../../features/auth/authSlice";
import { loadStates } from "../../utils/helpers";
import { setCategories, setServices } from "../../features/statics/staticsSlice";
import { Emoji } from "animated-fluent-emojis";

const SuccessfulPayment = () => {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [userEmail, setUserEmail] = useState("");
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [currentStep, setCurrentStep] = useState<number>(1);

    const loginAdmin = async (values: any) => {
        setLoading(true);
        try {
            const res = await api.post("/login", values);
            console.log("Login response:", res.data);
            loadStates()
            localStorage.setItem('userToken', res?.data?.token);
            localStorage.setItem('userId', res?.data?.payload?.id);
            dispatch(setUserData(res?.data?.payload));
            dispatch(setCategories(res?.data?.payload?.formattedCategories));
            dispatch(setServices(res?.data?.payload?.formattedServices));
            navigate('/dashboard')
            toast.success('Login Successful!')
            // setUserEmail(values.email);
            setLoading(false);
            // setStep(2); // proceed to OTP verification
        } catch (error) {
            console.error(error);
            setLoading(false);
            toast.error('Invalid Credentials')
        }
    };

    // ✅ Step 1 validation
    const loginSchema = Yup.object().shape({
        email: Yup.string()
            .email("Please enter a valid email address")
            .required("Email is required"),
        password: Yup.string()
            .min(6, "Password must be at least 6 characters")
            .required("Password is required"),
    });
    return (
        <div className="home-container">
            <div className="left">
                {/* <h3 style={{ fontWeight: '900', fontSize: '28px' }}>
                    Fine Dining At Your
                    Door step.
                </h3> */}
                {/* <div className="w-100 d-flex align-items-center justify-content-center">
                    <Image src={ownerImg} />
                </div> */}

            </div>
            <div className="right ">
                <div className="w-100 text-center">
                    <Image src={adminLogo} height={28} />
                </div>
                <div className="form-container p-4 align-items-center justify-content-center text-center">
                    <i className="bi bi-hand-thumbs-up-fill fs-1 text-success"></i>
                    <p>Booking Completed!</p>
                </div>

            </div>

        </div>
    )
}
export default SuccessfulPayment;