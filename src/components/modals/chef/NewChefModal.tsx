import React, { useState } from "react";
import { Modal, ProgressBar } from "react-bootstrap";
import { Formik, Form, ErrorMessage, FieldArray, Field } from "formik";
import * as Yup from "yup";
import CustomButton from "../../custom-button/custom-button";
import ReusableInputs from "../../custom-input/ReusableInputs";
import api from "../../../app/api";
import { toast } from "react-toastify";
import { ReusableForm } from "../../forms/ReusableForm";
import ReusableDropDownStates from "../../custom-input/ReusableDropDownStates";

interface IAuthModal {
    on: boolean;
    off: () => void;
    onLogin: () => void;
}

// --- Step Schemas ---
const step1Schema = Yup.object({
    staffId: Yup.string().required("Staff Id is required"),
    name: Yup.string().required("Full name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    gender: Yup.string().required("Gender is required"),
});

const step2Schema = Yup.object({
    specialties: Yup.array()
        .of(Yup.string().trim().required())
        .min(1, "At least one specialty is required")
        .required("Specialties is required"),
    phoneNumber: Yup.string().required("Required"),
    state: Yup.object().required("Required"),
    location: Yup.object().required("Required"),
});

const step3Schema = Yup.object({
    chefPic: Yup.mixed()
        .required("Profile picture is required")
        .test("fileSize", "File too large", (value: any) => !value || (value && value.size <= 5 * 1024 * 1024)) // max 5MB
        .test("fileType", "Unsupported file format", (value: any) =>
            !value || (value && ["image/jpeg", "image/png", "image/jpg"].includes(value.type))
        ),
    password: Yup.string()
        .min(8, "Password must be at least 8 characters")
        .matches(/[A-Z]/, "Must contain one uppercase letter")
        .matches(/[!@#$%^&*(),.?\":{}|<>]/, "Must contain one special character")
        .required("Password is required"),
    bio: Yup.string().required("Bio is required"),
});

const NewChefModal: React.FC<IAuthModal> = ({ on, off, onLogin }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const statesString = localStorage.getItem("states");
    const states = statesString ? JSON.parse(statesString) : [];
    const formatedStatesForDropDown = states.map((state: any) => ({
        label: state?.state,
        value: state?.state,
        cities: state?.localGovernmentAreas,
    }));
    const [selectedStateCities, setSelectedStateCities] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        staffId: "",
        name: "",
        gender: "",
        email: "",
        bio: "",
        phoneNumber: "",
        specialties: [],
        location: null,
        state: null,
        chefPic: null,
        password: "",
        stateId:"22"
    });

    // --- Register user ---
    const registerUser = async (values: any) => {
    setLoading(true);
    try {
        // Exclude temporary input field and convert state/location to strings
        const { specialtyInput, ...rest } = values;
        const processedValues = {
            ...rest,
            state: rest.state?.value || rest.state || "",
            location: rest.location?.value || rest.location || "",
        };

        // Using FormData for file upload
        const formPayload = new FormData();

        Object.keys(processedValues).forEach((key) => {
            // If key is specialties, append as JSON string
            if (key === "specialties") {
                formPayload.append(key, JSON.stringify(processedValues[key]));
            } else {
                formPayload.append(key, processedValues[key]);
            }
        });

        const res = await api.post("chef/register", formPayload, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        console.log("User registered:", res.data);
        toast.success("Chef registered successfully!");
        off();
    } catch (error: any) {
        toast.error(error?.data?.message || "Something went wrong");
        console.error(error);
    } finally {
        setLoading(false);
    }
};

    // --- Step handlers ---
    const handleNext = (values: any) => {
        setFormData({ ...formData, ...values });
        setStep(step + 1);
    };

    const handleBack = (values: any) => {
        setFormData({ ...formData, ...values });
        setStep(step - 1);
    };

    return (
        <Modal size="lg" show={on} onHide={off} centered>
            <Modal.Header closeButton>
                <Modal.Title className="d-flex gap-3">
                    {step > 1 && <i onClick={() => setStep(step - 1)} className="bi bi-arrow-left" role="button"></i>}
                    Create New Chef
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <div className="text-end">{step} of 3</div>
                <ProgressBar now={(step / 3) * 100} className="mb-3" />

                {/* STEP 1 — Basic Info */}
                {step === 1 && (
                    <ReusableForm
                        buttonTitle={"Next"}
                        loading={loading}
                        initialValues={{
                            staffId: formData.staffId,
                            name: formData.name,
                            gender: formData.gender,
                            email: formData.email,
                        }}
                        validationSchema={step1Schema}
                        onSubmit={handleNext}
                    >
                        <ReusableInputs label="Staff ID" placeholder="Enter staff ID" inputType="text" name="staffId" id="staffId" />
                        <ErrorMessage name="staffId" component="div" className="text-danger small mt-1" />

                        <ReusableInputs label="Full Name" placeholder="Enter your full name" inputType="text" name="name" id="name" />
                        <ErrorMessage name="name" component="div" className="text-danger small mt-1" />

                        <ReusableInputs label="Email" placeholder="Enter your email" inputType="email" name="email" id="email" />
                        <ErrorMessage name="email" component="div" className="text-danger small mt-1" />

                        <ReusableInputs label="Gender" inputType="radio-button" name="gender" id="gender" />
                        <ErrorMessage name="gender" component="div" className="text-danger small mt-1" />
                    </ReusableForm>
                )}

                {/* STEP 2 — Specialties, Phone, State, Location */}
                {step === 2 && (
                    <Formik
                        initialValues={{
                            specialties: formData.specialties,
                            specialtyInput: "",
                            phoneNumber: formData.phoneNumber,
                            state: formData.state,
                            location: formData.location,
                        }}
                        validationSchema={step2Schema}
                        onSubmit={(values) => handleNext({ ...formData, ...values })}
                    >
                        {({ values, handleSubmit, setFieldValue }) => (
                            <Form onSubmit={handleSubmit}>
                                {/* Specialty input */}
                                <div className="mb-2">
                                    <label className="form-label">Chef Specialty</label>
                                    <div className="d-flex gap-2">
                                        <Field name="specialtyInput" className="form-control" placeholder="Enter specialty e.g. Pastry Chef" />
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary"
                                            onClick={() => {
                                                if (!values.specialtyInput.trim()) return;
                                                setFieldValue("specialties", [...values.specialties, values.specialtyInput.trim()]);
                                                setFieldValue("specialtyInput", "");
                                            }}
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>

                                {/* Render specialties list */}
                                <FieldArray name="specialties">
                                    {({ remove }) => (
                                        <ul className="list-group mb-3">
                                            {values.specialties.map((item, index) => (
                                                <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                                    {item}
                                                    <button type="button" className="btn btn-sm btn-danger" onClick={() => remove(index)}>
                                                        ✕
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </FieldArray>
                                <ErrorMessage name="specialties" component="div" className="text-danger small mt-1" />

                                {/* Phone number */}
                                <ReusableInputs label="Phone Number" placeholder="Enter phone number" inputType="text" name="phoneNumber" id="phoneNumber" />
                                <ErrorMessage name="phoneNumber" component="div" className="text-danger small mt-1" />

                                {/* State */}
                                <ReusableDropDownStates
                                    options={formatedStatesForDropDown}
                                    passSelectedValue={(v) => setSelectedStateCities(v?.cities)}
                                    label="State"
                                    placeholder="Select State"
                                    inputType="text"
                                    name="state"
                                    id="state"
                                />
                                <ErrorMessage name="state" component="div" className="text-danger small mt-1" />

                                {/* Location */}
                                <ReusableDropDownStates
                                    options={selectedStateCities.map((city) => ({ label: city, value: city }))}
                                    label="Location"
                                    placeholder="Select location"
                                    inputType="text"
                                    name="location"
                                    id="location"
                                />
                                <ErrorMessage name="location" component="div" className="text-danger small mt-1" />

                                <CustomButton loading={loading} className="w-100 mt-3 text-light" title="Next" type="submit" />
                            </Form>
                        )}
                    </Formik>
                )}

                {/* STEP 3 — Profile Picture, Password, Bio */}
                {step === 3 && (
                    <Formik
                        initialValues={{
                            chefPic: formData.chefPic,
                            password: formData.password,
                            bio: formData.bio,
                        }}
                        validationSchema={step3Schema}
                        onSubmit={(values) => registerUser({ ...formData, ...values })}
                    >
                        {({ values, handleSubmit, setFieldValue }) => {
                            const password = values.password;
                            const hasMinLength = password.length >= 8;
                            const hasUppercase = /[A-Z]/.test(password);
                            const hasSpecialChar = /[!@#$%^&*(),.?\":{}|<>]/.test(password);

                            return (
                                <Form onSubmit={handleSubmit}>
                                    {/* Profile Picture */}
                                    <div className="text-start mb-3">
                                        <label className="form-label">Profile Picture</label>
                                        <input
                                            type="file"
                                            accept="image/png, image/jpeg, image/jpg"
                                            onChange={(e: any) => setFieldValue("chefPic", e.currentTarget.files[0])}
                                            className="form-control"
                                        />
                                        <ErrorMessage name="chefPic" component="div" className="text-danger small mt-1" />
                                        {values.chefPic && (
                                            <img
                                                src={URL.createObjectURL(values.chefPic)}
                                                alt="Preview"
                                                className="mt-2"
                                                style={{ width: "100px", height: "100px", objectFit: "cover", alignItems: 'center', borderRadius: "50%" }}
                                            />
                                        )}
                                    </div>

                                    {/* Password */}
                                    <ReusableInputs icon2="bi bi-eye-slash" label="Set Password" placeholder="Enter password" inputType="password" name="password" id="password" />

                                    <ul className="text-start small mt-3">
                                        <li className={hasMinLength ? "text-success" : "text-danger"}>At least 8 characters</li>
                                        <li className={hasUppercase ? "text-success" : "text-danger"}>Contains one uppercase letter</li>
                                        <li className={hasSpecialChar ? "text-success" : "text-danger"}>Contains one special character</li>
                                    </ul>

                                    {/* Bio */}
                                    <ReusableInputs label="Bio" placeholder="Write a short bio" inputType="textarea" name="bio" id="bio" />
                                    <ErrorMessage name="bio" component="div" className="text-danger small mt-1" />

                                    <CustomButton loading={loading} className="w-100 mt-3 text-light" title="Submit" type="submit" />
                                </Form>
                            );
                        }}
                    </Formik>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default NewChefModal;