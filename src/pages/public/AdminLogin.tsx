import { Badge, Col, Container, Image, Row } from "react-bootstrap";
import './adminLogin.css';
import ownerImg from '../../assets/images/rentAChefOwnerWeb.png';
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
import relmpayLogo from '../../assets/images/relmpayLogo.png'

const AdminLoginPage = () => {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [userEmail, setUserEmail] = useState("");
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [currentStep, setCurrentStep] = useState<number>(1);

    const loginAdmin = async (values: any) => {
        setLoading(true);
        try {
            const res = await api.post("/admin/login", values);
            console.log("Login response:", res.data);
            loadStates()
            localStorage.setItem('userToken', res?.data?.token);
            localStorage.setItem('userId', res?.data?.payload?.id);
            dispatch(setUserData(res?.data?.payload))
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
        <div className="login-container p-5">
            <div className="w-100 d-flex justify-content-center">
                <div className="bg-light w-25 rounded p-3">
                    <ReusableForm
                        onSubmit={loginAdmin}
                        initialValues={{ email: '', password: '' }}
                        validationSchema={loginSchema}
                        loading={false}
                        buttonTitle="Login"
                    >
                        <div className="d-flex flex-row justify-content-between">
                            <div className="w-100 d-flex justify-content-center">
                                <Image src={relmpayLogo} height={84} />
                            </div>
                            {/* <div>
                                        <Badge onClick={() => setCurrentStep(2)} className="bg-info rounded p-2" role="button"> +Create New Chef</Badge>
                                    </div> */}
                        </div>

                        <div>
                            <ReusableInputs
                                name="email"
                                inputType="text-input"
                                id="email"
                                label=""
                                placeholder="Enter Email"
                            />
                            <ErrorMessage
                                name="email"
                                component="div"
                                className="text-danger small mt-1"
                            />
                        </div>

                        <div>
                            <ReusableInputs
                                icon2="bi bi-eye-slash-fill"
                                name="password"
                                inputType="password"
                                id="password"
                                label=""
                                placeholder="Password"
                            />
                            <ErrorMessage
                                name="password"
                                component="div"
                                className="text-danger small mt-1"
                            />
                        </div>


                    </ReusableForm>
                </div>
            </div>

            <div className="w-100 d-flex justify-content-center mt-5">
                <p role="button" className="text-light">New User? Create Account</p>
            </div>
            <div className="w-100 d-flex justify-content-center">
                <p role="button" className="text-light">Forgot password?</p>
            </div>

        </div>
    )
}
export default AdminLoginPage;