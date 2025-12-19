import React, { useState, useRef } from "react";
import { Modal } from "react-bootstrap";
import { Formik, Form, ErrorMessage, Field } from "formik";
import * as Yup from "yup";
import api from "../../../app/api";
import ReusableInputs from "../../custom-input/ReusableInputs";
import CustomButton from "../../custom-button/custom-button";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserData } from "../../../features/auth/authSlice";
import { ReusableForm } from "../../forms/ReusableForm";

interface IAuthModal {
  on: boolean;
  off: () => void;
  onSignUp: () => void;
}

// ✅ Step 1 validation
const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

// ✅ Step 2 validation
const otpSchema = Yup.object().shape({
  otp: Yup.string()
    .length(6, "OTP must be 6 digits")
    .matches(/^[0-9]+$/, "OTP must be numeric")
    .required("OTP is required"),
});

const LoginModal: React.FC<IAuthModal> = ({ on, off, onSignUp }) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch()

  const loginUser = async (values: any) => {
    setLoading(true);
    try {
      const res = await api.post("auth/login", values);
      console.log("Login response:", res.data);
      setUserEmail(values.email);
      setLoading(false);
      setStep(2); // proceed to OTP verification
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const verifyOtp = async (values: any) => {
    setLoading(true);
    try {
      const res = await api.post("auth/verify-otp", {
        email: userEmail,
        otp: values.otp,
      });
      toast.success('Login Succesful!')
      console.log("See data", res.data);
      navigate('/dashboard/profile');
      setLoading(false);
      console.log({savedToRedux:res.data?.payload?.userBio})
      dispatch(setUserData(res.data?.payload?.userBio))
      localStorage.setItem('userToken', res.data?.payload?.token);
      localStorage.setItem('userId', res.data?.payload?.userBio?.id);
      off();
    } catch (error) {
      toast.error('Login error!')
      console.error(error);
      setLoading(false);
    }
  };

  // Auto-focus logic for 6-digit OTP inputs
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleOtpChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    setFieldValue: any,
    otp: string
  ) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 1);
    const newOtp = otp.split("");
    newOtp[index] = value;
    const joinedOtp = newOtp.join("");
    setFieldValue("otp", joinedOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  return (
    <Modal show={on} onHide={off} centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex gap-3">
          {step > 1 && <i onClick={() => setStep(1)} className="bi bi-arrow-left" role="button"></i>}
          {step === 1 ? "Welcome Back" : "OTP Verification"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="text-center">
        {step === 1 && (
          <>
            <ReusableForm
            buttonTitle="Login"
              loading={loading}
              initialValues={{ email: "", password: "" }}
              validationSchema={loginSchema}
              onSubmit={loginUser}
            >
              <p className="mb-4">Please log in to continue.</p>
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
                  icon2="bi bi-eye-slash"
                  label="Password"
                  placeholder="Enter your password"
                  inputType="password"
                  name="password"
                  id="password"
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-danger small mt-1"
                />
              </div>

              <div className="mt-3">
                New user?{" "}
                <a
                  href="#"
                  className="fw-bold"
                  onClick={onSignUp}
                  role="button"
                >
                  Register
                </a>
              </div>

            </ReusableForm>
          </>
        )}

        {step === 2 && (
          <Formik
            initialValues={{ otp: "" }}
            validationSchema={otpSchema}
            onSubmit={verifyOtp}
          >
            {({ handleSubmit, values, setFieldValue }) => (
              <Form onSubmit={handleSubmit}>
                <p className="mb-3">
                  Enter the 6-digit code sent to <strong>{userEmail}</strong>
                </p>

                <div className="d-flex justify-content-center gap-2 mb-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Field
                      key={index}
                      name={`otp-${index}`}
                      type="text"
                      maxLength="1"
                      inputMode="numeric"
                      className="form-control text-center"
                      style={{
                        width: "40px",
                        height: "45px",
                        fontSize: "20px",
                      }}
                      innerRef={(el: HTMLInputElement) =>
                        (inputsRef.current[index] = el)
                      }
                      value={values.otp[index] || ""}
                      onChange={(e: any) =>
                        handleOtpChange(e, index, setFieldValue, values.otp)
                      }
                    />
                  ))}
                </div>

                <ErrorMessage
                  name="otp"
                  component="div"
                  className="text-danger small mt-1"
                />

                <div className="d-flex justify-content-between mt-4">
                  <CustomButton
                    className="w-100"
                    title="Verify OTP"
                    type="submit"
                    loading={loading}
                  />
                </div>
              </Form>
            )}
          </Formik>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default LoginModal;