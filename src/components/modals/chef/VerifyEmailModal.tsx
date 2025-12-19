import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import CustomButton from "../../custom-button/custom-button";
import api from "../../../app/api";
import { toast } from "react-toastify";

interface IVerifyEmailModal {
  on: boolean;
  off: () => void;
  email: string;
}

// Validation Schema
const otpSchema = Yup.object({
  otp: Yup.string()
    .length(6, "OTP must be 6 digits")
    .matches(/^[0-9]+$/, "OTP must be numeric")
    .required("OTP is required"),
});

const VerifyEmailModal: React.FC<IVerifyEmailModal> = ({ on, off, email }) => {
  const [loading, setLoading] = useState(false);

  const verifyOtp = async (values: any) => {
    setLoading(true);
    try {
      const res = await api.post(`/auth/verify-email-otp?token=${values.otp}`, {
        token: values.otp,
        otp: values.otp,
      });
      console.log("Email verified:", res.data);
      toast.success("Email verified successfully!");
      off(); // close modal
    } catch (error) {
      console.error(error);
      toast.error("Failed to verify OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={on} onHide={off} centered>
      <Modal.Header closeButton>
        <Modal.Title>Email Verification</Modal.Title>
      </Modal.Header>

      <Modal.Body>
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
                  Enter the 6-digit code sent to <strong>{email}</strong>
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
                        values.otp.substring(0, i) +
                        e.target.value +
                        values.otp.substring(i + 1);
                      handleChange({
                        target: { name: "otp", value: newOtp },
                      });
                    }}
                    className="form-control text-center fw-bold fs-5"
                    style={{
                      width: "45px",
                      borderRadius: "10px",
                      border: "1px solid #ccc",
                    }}
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
      </Modal.Body>
    </Modal>
  );
};

export default VerifyEmailModal;