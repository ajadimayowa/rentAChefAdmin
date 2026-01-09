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


const CreateChefMenu: React.FC<IAuthModal> = ({ on, chefName, chefId, off, onLogin }) => {
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
        chef: string;
        title: string;
        menuPic: File | null;
        basePrice: number | null;
    }
    const initialValues: MenuItem = {
        chef: chefId,
        title: "",
        menuPic: null,
        basePrice: null,
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


    const createMenu = async (values: any) => {
        setLoading(true);
        try {

            // Using FormData for file upload
            const formPayload = new FormData();

            Object.keys(values).forEach((key) => {
               formPayload.append(key, values[key]);
            });

            const res = await api.post("menu/create", formPayload, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            console.log("Menu created:", res?.data);
            toast.success("Menu succesfully created!");
            window.location.reload()
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
                    {`Create Menu For Chef ${chefName.split(" ")[1]} `}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={(values) => createMenu(values)}
                >
                    {({ values, handleSubmit, setFieldValue }) => (
                        <Form onSubmit={handleSubmit}>
                            <p className="p-0 m-0 fw-bold">Select Menu Picture</p>
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
                            </div>
                            <ErrorMessage name="menuPic" component="div" className="text-danger small mt-1" />

                            <ReusableInputs label="Menu name" placeholder="Enter name of menu" inputType="text" name="title" id="title" />
                            <ErrorMessage name="title" component="div" className="text-danger small mt-1" />

                            {/* Phone number */}
                            <ReusableInputs label="Price per person (N)" placeholder="Enter price for one person" inputType="text" name="basePrice" id="basePrice" />
                            <ErrorMessage name="basePrice" component="div" className="text-danger small mt-1" />

                            <CustomButton loading={loading} className="w-100 mt-3 text-light" title="Save" type="submit" />
                        </Form>
                    )}
                </Formik>
            </Modal.Body>
        </Modal>
    );
};

export default CreateChefMenu;