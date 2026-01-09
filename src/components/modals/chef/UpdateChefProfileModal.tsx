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
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";


interface IAuthModal {
    on: boolean;
    off: () => void;
    onLogin: () => void;
    chefName: string;
    chefId: string
}


const UpdateChefProfileModal: React.FC<IAuthModal> = ({ on, chefName, chefId, off, onLogin }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const statesString = localStorage.getItem("states");
    const states = statesString ? JSON.parse(statesString) : [];
    const chefCategories = useSelector((state: RootState) => (state.statics.categories))
    const formatedStatesForDropDown = states.map((state: any) => ({
        label: state?.state,
        value: state?.state,
        cities: state?.localGovernmentAreas,
    }));
    const [selectedStateCities, setSelectedStateCities] = useState<string[]>([]);

    interface MenuItem {
         staffId: "",
         name: "",
         phoneNumber: "",
         location: null,
        state: null,
        chefPic: null,
        chef: string;
        title: string;
        menuPic: File | null;
        basePrice: number | null;
        category:null
    }
    const initialValues: MenuItem = {
        staffId: "",
        name: "",
        phoneNumber: "",
        chef: chefId,
        location: null,
        state: null,
        chefPic: null,
        title: "",
        menuPic: null,
        basePrice: null,
        category:null
    };

    const validationSchema = Yup.object({
        chef: Yup.string()
            .required("Chef is required"),

        title: Yup.string()
            .required("Title is required")
            .min(3, "Title must be at least 3 characters"),

        menuPic: Yup.mixed<File>()
            .required("Menu picture is required")
            .test(
                "fileType",
                "Only image files are allowed",
                (value) =>
                    value instanceof File &&
                    ["image/jpeg", "image/png", "image/webp"].includes(value.type)
            )
            .test(
                "fileSize",
                "Image size must be less than 2MB",
                (value) =>
                    value instanceof File && value.size <= 2 * 1024 * 1024
            ),

        basePrice: Yup.number()
            .nullable()
            .typeError("Base price must be a number")
            .min(0, "Base price cannot be negative")
            .required("Base price is required"),
    });


    const updateChef = async (values: any) => {
    setLoading(true);
    try {
        // Exclude temporary input field and convert state/location to strings
        const { specialtyInput, ...rest } = values;
        const processedValues = {
            ...rest,
            state: rest.state?.value || rest.state || "",
            location: rest.location?.value || rest.location || "",
            category: rest.category?.value || rest.category || "",
            categoryName: rest.category?.label || rest.category || "",
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

        const res = await api.put(`chef/update/${chefId}`, formPayload, {
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


    return (
        <Modal size="lg" show={on} onHide={off} centered>
            <Modal.Header closeButton>
                <Modal.Title className="d-flex gap-3">
                    {`Update Chef ${chefName.split(" ")[1]} profile`}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Formik
                    initialValues={initialValues}
                    // validationSchema={validationSchema}
                    onSubmit={(values) => updateChef(values)}
                >
                    {({ values, handleSubmit, setFieldValue }) => (
                        <Form onSubmit={handleSubmit}>
                            <ReusableInputs label="Chef ID" placeholder="Enter chef ID" inputType="text" name="staffId" id="staffId" />
                        <ErrorMessage name="staffId" component="div" className="text-danger small mt-1" />

                        <ReusableInputs label="Full Name" placeholder="Enter full name" inputType="text" name="name" id="name" />
                        <ErrorMessage name="name" component="div" className="text-danger small mt-1" />

                        <ReusableInputs label="Phone number" placeholder="Enter phone number" inputType='numberInput' name="phoneNumber" id="phoneNumber" />
                        <ErrorMessage name="phoneNumber" component="div" className="text-danger small mt-1" />

                        

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

                                <ReusableDropDownStates
                                    options={chefCategories}
                                    label="Category"
                                    placeholder="Select chef category"
                                    inputType="text"
                                    name="category"
                                    id="category"
                                />
                                <ErrorMessage name="category" component="div" className="text-danger small mt-1" />

                            {/* <p className="p-0 m-0 mt-4 fw-bold">Select Profile Picture</p>
                             <div className="d-flex gap-3 align-items-center">
                                <label htmlFor="menuPic" style={{ cursor: "pointer" }}>
                                    <i className="bi bi-camera fs-1"></i>
                                </label>

                                <input
                                    id="menuPic"
                                    type="file"
                                    accept="image/*"
                                    style={{ display: "none" }}
                                    onChange={(event) => {
                                        const file = event.currentTarget.files?.[0];
                                        if (file) {
                                            setFieldValue("menuPic", file);
                                        }
                                    }}
                                />

                                {values.menuPic ? (
                                    <img
                                        src={URL.createObjectURL(values.menuPic)}
                                        alt="Selected menu"
                                        width={60}
                                        height={60}
                                        className="rounded"
                                        style={{ objectFit: "cover" }}
                                    />
                                ) : (
                                    <p className="mb-0 text-muted"></p>
                                )}
                            </div> */}

                            <CustomButton loading={loading} className="w-100 mt-3 text-light" title="Save" type="submit" />
                        </Form>
                    )}
                </Formik>
            </Modal.Body>
        </Modal>
    );
};

export default UpdateChefProfileModal;