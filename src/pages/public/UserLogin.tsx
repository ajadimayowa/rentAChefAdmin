import { Badge, Col, Container, Image, Row } from "react-bootstrap";
import './adminLogin.css';
import ownerImg from '../../assets/images/rentAChefOwnerWeb.png';
import androidIcon from '../../assets/images/android-icon.png';
import adminLogo from '../../assets/images/rentAChefAdminLogo.png';
import { ErrorMessage, Formik } from "formik";
import { ReusableForm } from "../../components/forms/ReusableForm";
import CustomInput from "../../components/custom-input/CustormInput";
import * as Yup from "yup";
import ReusableInputs from "../../components/custom-input/ReusableInputs";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import api from "../../app/api";
import { toast } from "react-toastify";
import { setUserData } from "../../features/auth/authSlice";
import { loadStates } from "../../utils/helpers";
import { setCategories, setServices } from "../../features/statics/staticsSlice";

const UserLogin = () => {
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
                <div className="w-100 d-flex justify-content-between align-items-center">
                     <Image src={adminLogo} height={28} />
                <Link to={'https://expo.dev/artifacts/eas/czgjGF2EHvm7HjSw3RgFW7.apk'}>
                                    <Image role="button" height={80} src={androidIcon}/>
                                    </Link>
                </div>
                <div className="form-container d-flex p-4 align-items-center w-100">
                    {
                        currentStep == 1 &&
                        <>
                            <ReusableForm
                                onSubmit={loginAdmin}
                                initialValues={{ email: '', password: '' }}
                                validationSchema={loginSchema}
                                loading={loading}
                                fromLoginPage={true}
                                buttonTitle="Login"
                            >
                                <div className="d-flex flex-row justify-content-between">
                                    <h5 className="text-primary mb-5">
                                        Customer Login
                                    </h5>
                                    {/* <div>
                                        <Badge onClick={() => setCurrentStep(2)} className="bg-info rounded p-2" role="button"> +Create New Chef</Badge>
                                    </div> */}
                                </div>

                                <div>
                                    <ReusableInputs
                                        name="email"
                                        inputType="text-input"
                                        id="email"
                                        label="Enter Email"
                                        placeholder="Email"
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
                                        label="Enter Password"
                                        placeholder="Password"
                                    />
                                    <ErrorMessage
                                        name="password"
                                        component="div"
                                        className="text-danger small mt-1"
                                    />
                                </div>


                            </ReusableForm>
                        </>

                    }

                    {
                        currentStep == 2 &&
                        <>
                            <ReusableForm
                                onSubmit={() => console.log('ok')}
                                initialValues={{ email: '', password: '' }}
                                validationSchema={loginSchema}
                                loading={false}
                                buttonTitle="Login"
                            >
                                <div className="d-flex flex-row justify-content-between">
                                    <h5 className="text-primary mb-5">
                                        Create New Chef
                                    </h5>
                                    <div>
                                        <Badge onClick={() => setCurrentStep(1)} className="bg-info rounded p-2" role="button">Admin Login</Badge>
                                    </div>
                                </div>


                                <div>
                                    <ReusableInputs
                                        name="staffId"
                                        inputType="text-input"
                                        id="staffId"
                                        label="Staff ID"
                                        placeholder="Enter staff id"
                                    />
                                    <ErrorMessage
                                        name="staffId"
                                        component="div"
                                        className="text-danger small mt-1"
                                    />
                                </div>


                                <div>
                                    <ReusableInputs
                                        name="name"
                                        inputType="text-input"
                                        id="name"
                                        label="Full Name"
                                        placeholder="Enter fullname"
                                    />
                                    <ErrorMessage
                                        name="nmae"
                                        component="div"
                                        className="text-danger small mt-1"
                                    />
                                </div>

                                <div>
                                    <ReusableInputs
                                        name="name"
                                        inputType="text-input"
                                        id="name"
                                        label="Gender"
                                        placeholder="Enter fullname"
                                    />
                                    <ErrorMessage
                                        name="gender"
                                        component="div"
                                        className="text-danger small mt-1"
                                    />
                                </div>

                                <div>
                                    <ReusableInputs
                                        name="email"
                                        inputType="text-input"
                                        id="email"
                                        label="Staff Email"
                                        placeholder="Enter email"
                                    />
                                    <ErrorMessage
                                        name="gender"
                                        component="div"
                                        className="text-danger small mt-1"
                                    />
                                </div>
                            </ReusableForm>
                        </>
                    }


                </div>

            </div>

        </div>
    )
}
export default UserLogin;