import React, { useState } from "react";
import { Modal, ProgressBar } from "react-bootstrap";
import { Formik, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import CustomButton from "../../custom-button/custom-button";
import ReusableInputs from "../../custom-input/ReusableInputs";
import api from "../../../app/api";
import { toast } from "react-toastify";
import { ReusableForm } from "../../forms/ReusableForm";

interface IAuthModal {
    on: boolean;
    off: () => void;
    onLogin: () => void;
}

// Validation Schemas
const userInfoSchema = Yup.object({
    fullName: Yup.string().required("Full name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phoneNumber: Yup.string().required("Phone number is required"),
});

const passwordSchema = Yup.object({
    password: Yup.string()
        .min(8, "Password must be at least 8 characters")
        .matches(/[A-Z]/, "Must contain one uppercase letter")
        .matches(/[!@#$%^&*(),.?\":{}|<>]/, "Must contain one special character")
        .required("Password is required"),
});

const otpSchema = Yup.object({
    otp: Yup.string()
        .length(6, "OTP must be 6 digits")
        .matches(/^[0-9]+$/, "OTP must be numeric")
        .required("OTP is required"),
});

const SignUpModal: React.FC<IAuthModal> = ({ on, off, onLogin }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phoneNumber: "",
        password: "",
    });
    const [emailForOtp, setEmailForOtp] = useState("");

    // --- Register user ---
    const registerUser = async (values: any) => {
        setLoading(true);
        try {
            const res = await api.post("auth/register", values);
            console.log("User registered:", res.data);
            setEmailForOtp(values.email);
            setStep(3); // Move to OTP verification step
        } catch (error:any) {
            toast.error(error?.data?.message)
            console.error(error);
        } finally {
            setLoading(false);
            
        }
    };

    // --- Verify OTP ---
    const verifyOtp = async (values: any) => {
        setLoading(true);
        try {
            const res = await api.post(`/auth/verify-email-otp?token=${values.otp}`, {
                token: values.otp,
                otp: values.otp,
            });
            console.log("Email verified:", res.data);
            toast.success('Email verified succesfully!')
            setLoading(false);
            off(); // Close modal after successful verification
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    // --- Step handlers ---
    const handleNext = (values: any) => {
        setFormData({ ...formData, ...values });
        setStep(step +1);
    };

    const handleBack = (values: any) => {
        setFormData({ ...formData, ...values });
        setStep(1);
    };

    return (
        <Modal show={on} onHide={() => window.location.reload()} centered>
            <Modal.Header closeButton>
                <Modal.Title className="d-flex gap-3">{step > 1 && <i onClick={() => setStep(step - 1)} className="bi bi-arrow-left" role="button"></i>} Sign Up</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <div className="text-end">{step} of {3}</div>
                <ProgressBar now={(step / 3) * 100} className="mb-3" />

                {/* STEP 1 — Basic Info */}
                {step === 1 && (
                    <>
                    <ReusableForm
                    buttonTitle={'Next'}
                    loading={loading}
initialValues={{
                            fullName: formData.fullName,
                            email: formData.email,
                            phoneNumber: formData.phoneNumber,
                        }}
                        validationSchema={userInfoSchema}
                        onSubmit={handleNext}
                    >
                        <div className="text-start mb-3">
                                    <ReusableInputs
                                        label="Full Name"
                                        placeholder="Enter your full name"
                                        inputType="text"
                                        name="fullName"
                                        id="fullName"
                                    />
                                    <ErrorMessage
                                        name="fullName"
                                        component="div"
                                        className="text-danger small mt-1"
                                    />
                                </div>
                                <div className="text-start mb-3">
                                    <ReusableInputs
                                        label="Email"
                                        placeholder="Enter your email"
                                        inputType="email"
                                        name="email"
                                        id="email"
                                    />
                                    <ErrorMessage
                                        name="email"
                                        component="div"
                                        className="text-danger small mt-1"
                                    />
                                </div>
                                <div className="text-start mb-3">
                                    <ReusableInputs
                                        label="Phone Number"
                                        placeholder="Enter phone number"
                                        inputType="text"
                                        name="phoneNumber"
                                        id="phoneNumber"
                                    />
                                    <ErrorMessage
                                        name="phoneNumber"
                                        component="div"
                                        className="text-danger small mt-1"
                                    />
                                </div>

                    </ReusableForm>
                   
                    </>
                )}

                {/* STEP 2 — Password */}
                {step === 2 && (
                    <Formik
                        initialValues={{ password: formData.password }}
                        validationSchema={passwordSchema}
                        onSubmit={(values) => registerUser({ ...formData, ...values })}
                    >
                        {({ values, handleSubmit }) => {
                            const password = values.password;
                            const hasMinLength = password.length >= 8;
                            const hasUppercase = /[A-Z]/.test(password);
                            const hasSpecialChar = /[!@#$%^&*(),.?\":{}|<>]/.test(password);

                            return (
                                <Form onSubmit={handleSubmit}>
                                    <ReusableInputs
                                        icon2="bi bi-eye-slash"
                                        label="Set Password"
                                        placeholder="Enter password"
                                        inputType="password"
                                        name="password"
                                        id="password"
                                    />

                                    <ul className="text-start small mt-3">
                                        <li className={hasMinLength ? "text-success" : "text-danger"}>
                                            ✅ At least 8 characters
                                        </li>
                                        <li className={hasUppercase ? "text-success" : "text-danger"}>
                                            ✅ Contains one uppercase letter
                                        </li>
                                        <li className={hasSpecialChar ? "text-success" : "text-danger"}>
                                            ✅ Contains one special character
                                        </li>
                                    </ul>

                                    <div className="d-flex justify-content-between mt-3">
                                        <CustomButton loading={loading} className="w-100 mt-3" title="Submit" type="submit" />
                                    </div>
                                </Form>
                            );
                        }}
                    </Formik>
                )}

                {/* STEP 3 — Email Verification */}
                {step === 3 && (
                    <Formik
                        initialValues={{ otp: "" }}
                        validationSchema={otpSchema}
                        onSubmit={verifyOtp}
                    >
                        {({ handleSubmit, values, handleChange }) => (
                            <Form onSubmit={handleSubmit}>
                                <div className="text-center mb-3">
                                    <h6>Verify Your Email</h6>
                                    <p className="small text-muted">
                                        Enter the 6-digit code sent to <strong>{emailForOtp}</strong>
                                    </p>
                                </div>

                                <div className="d-flex justify-content-between gap-2 mb-3">
                                    {[...Array(6)].map((_, i) => (
                                        <input
                                            key={i}
                                            type="text"
                                            maxLength={1}
                                            name="otp"
                                            value={values.otp[i] || ""}
                                            onChange={(e) => {
                                                const newOtp =
                                                    values.otp.substring(0, i) + e.target.value + values.otp.substring(i + 1);
                                                handleChange({ target: { name: "otp", value: newOtp } });
                                            }}
                                            className="form-control text-center fw-bold fs-5"
                                            style={{ width: "45px", borderRadius: "10px" }}
                                        />
                                    ))}
                                </div>

                                <CustomButton
                                    className="w-100"
                                    title="Verify Email"
                                    type="submit"
                                    loading={loading}
                                />
                            </Form>
                        )}
                    </Formik>
                )}

                {/* Login link */}

                <div className="mt-3 text-center">
                    Already a member?{" "}
                    <a href="#" className="fw-bold" onClick={onLogin} role="button">
                        Login
                    </a>
                </div>
                <div className="text-center mt-4"><small>By signing up, you agree to our </small> <a target="_blank" rel="noopener noreferrer" href="http://floatsolutionhub.com/terms-and-condition" className="text-danger">Terms & Conditions</a></div>
                <div className="text-center"><small>See our </small><a target="_blank" rel="noopener noreferrer" href="http://floatsolutionhub.com/privacy-policy" className="text-danger">Privacy policy here</a></div>
            </Modal.Body>
        </Modal>
    );
};

export default SignUpModal;