import React, { useEffect, useState } from "react";
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
import MultiSelectDropdown from "../../custom-input/MultiSelectDropdown";


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
    const chefServices = useSelector((state: RootState) => (state.statics.services))
    const formatedStatesForDropDown = states.map((state: any) => ({
        label: state?.state,
        value: state?.state,
        cities: state?.localGovernmentAreas,
    }));
    // normalize categories to { label, value } for react-select
    const normalizedChefCategories = (chefCategories || []).map((c: any) => ({
        label: c?.name || c?.title || c?.label || String(c),
        value: c?.id || c?._id || c?.value || String(c),
    }));
    const [selectedStateCities, setSelectedStateCities] = useState<string[]>([]);
    const [chefData, setChefData] = useState<any | null>(null);

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

    useEffect(() => {
        const loadChef = async () => {
            if (!on || !chefId) return;
            try {
                const res = await api.get(`chef/${chefId}`);
                const payload = res?.data?.payload || res?.data;
                const chef = payload?.chef || payload;
                setChefData(chef || null);
                // set selected state cities if state exists
                if (chef?.state) {
                    const stateObj = formatedStatesForDropDown.find((s: any) => s.value === chef.state);
                    setSelectedStateCities(stateObj?.cities || []);
                }
            } catch (err) {
                console.error(err);
            }
        };
        loadChef();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [on, chefId]);

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

        Object.entries(processedValues).forEach(([key, value]) => {
            if (value === undefined || value === null) return;

            if (Array.isArray(value)) {
                // append arrays as repeated fields
                value.forEach((item) => formPayload.append(`${key}[]`, typeof item === 'object' ? JSON.stringify(item) : String(item)));
                return;
            }

            if (value instanceof Blob) {
                formPayload.append(key, value);
                return;
            }

            if (typeof value === 'object') {
                formPayload.append(key, JSON.stringify(value));
                return;
            }

            formPayload.append(key, String(value));
        });

        // use correct update endpoint
        const res = await api.put(`chef/${chefId}`, formPayload, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        console.log("User updated:", res.data);
        // If servicesOffered were provided, call chefServices/create to register them
        try {
            const serviceIds = processedValues.servicesOffered || [];
            if (Array.isArray(serviceIds) && serviceIds.length > 0) {
                await api.post(`chefServices/create`, { chefId, serviceIds });
            }
        } catch (err) {
            console.warn('Failed to register chef services:', err);
            // non-fatal — continue
        }

        toast.success("Chef updated successfully!");
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
                    enableReinitialize
                    initialValues={{
                        staffId: chefData?.staffId || "",
                        name: chefData?.name || "",
                        phoneNumber: chefData?.phoneNumber || "",
                        chef: chefId,
                        state: chefData?.state ? { label: chefData.state, value: chefData.state } : null,
                        location: chefData?.location ? { label: chefData.location, value: chefData.location } : null,
                                                category: chefData?.category
                                                        ? (typeof chefData.category === 'string'
                                                                ? { label: chefData.categoryName || chefData.category, value: chefData.category }
                                                                : { label: chefData.category?.name || chefData.category?.label || chefData.categoryName || String(chefData.category), value: chefData.category?.id || chefData.category?._id || String(chefData.category) }
                                                            )
                                                        : null,
                        specialties: chefData?.specialties || [],
                        specialtyInput: "",
                        servicesOffered: chefData?.servicesOffered?.map((s: any) => (typeof s === 'string' ? s : (s.id || s._id || (s._id ? String(s._id) : '')))) || [],
                        chefPic: null,
                    }}
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
                                    options={normalizedChefCategories}
                                    label="Category"
                                    placeholder="Select chef category"
                                    inputType="text"
                                    name="category"
                                    id="category"
                                />
                                <ErrorMessage name="category" component="div" className="text-danger small mt-1" />

                                <div className="mt-3">
                                    {/** Normalize services to shape {id,name} for the dropdown */}
                                    {(() => {
                                        const serviceOptions = (chefServices || []).map((s: any) => ({ id: s.id || s._id || String(s), name: s.name || s.title || s.label || String(s) }));
                                            return (
                                            <MultiSelectDropdown
                                                options={serviceOptions}
                                                label="Services offered"
                                                value={(values.servicesOffered || []).map((s: any) => (typeof s === 'object' ? (s.id || s._id || String(s)) : String(s)))}
                                                onChange={(v: any) => setFieldValue('servicesOffered', (v || []).map((item: any) => (typeof item === 'object' ? (item.id || item.value || String(item)) : String(item))))}
                                            />
                                        );
                                    })()}
                                </div>

                                <div className="mb-2 mt-3">
                                    <label className="form-label">Chef Specialty</label>
                                    <div className="d-flex gap-2">
                                        <Field name="specialtyInput" className="form-control" placeholder="Enter specialty e.g. Pastry Chef" />
                                        <button
                                            type="button"
                                            className="btn btn-outline-primary"
                                            onClick={() => {
                                                if (!values.specialtyInput || !values.specialtyInput.trim()) return;
                                                setFieldValue("specialties", [...(values.specialties || []), values.specialtyInput.trim()]);
                                                setFieldValue("specialtyInput", "");
                                            }}
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>

                                <FieldArray name="specialties">
                                    {({ remove }) => (
                                        <ul className="list-group mb-3">
                                            {(values.specialties || []).map((item: any, index: number) => (
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

                            <CustomButton loading={loading} className="w-100 mt-3 text-light" title="Save" type="submit" />
                        </Form>
                    )}
                </Formik>
            </Modal.Body>
        </Modal>
    );
};

export default UpdateChefProfileModal;