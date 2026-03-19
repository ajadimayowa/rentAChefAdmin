import React, { useEffect, useState } from "react";
import { Modal, Button, Row, Col } from "react-bootstrap";
import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import * as Yup from "yup";
import api from "../../../app/api";
import { toast } from "react-toastify";
import ReusableDropDownSelect from "../../custom-input/ReusableDropDownSelect";
import ReusableInputs from "../../custom-input/ReusableInputs";

interface AddServicePlanModalProps {
    on: boolean;
    off: () => void;
    service: any;
    onSuccess?: () => void;
}

/* -------------------- FORM SHAPE -------------------- */
interface FormValues {
    "serviceId": string,
    "chefCategoryId": any,
    "price": string,
}

/* -------------------- VALIDATION -------------------- */
const validationSchema = Yup.object({
    services: Yup.array()
        .of(
            Yup.object({
                title: Yup.string().required("Title is required"),
                description: Yup.string().required("Description is required"),
                price: Yup.number()
                    .required("Price is required")
                    .min(0, "Price cannot be negative"),
            })
        )
        .min(1, "At least one service plan is required"),
});

const AddServicePricingModal: React.FC<AddServicePlanModalProps> = ({
    on,
    off,
    service,
    onSuccess,
}) => {
    const [loading, setLoading] = useState(false);
    const [chefCategories, setChefCategories] = useState<any[]>([]);

    const initialValues: FormValues = {
        "serviceId": service?.id ?? '',
        "chefCategoryId": "",
        "price": ""
    };

    const fetchChefCategories = async () => {
        // setLoading(true);
        try {
            const res = await api.get(`category/categories`);
            const formattedCategories = res?.data?.payload?.map((cat: any) => ({
                label: cat.name,
                value: cat.id,
            })) || [];
            setChefCategories(formattedCategories);
            // setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error("Unable to fetch chef categories");
            // setLoading(false);
        }
    };

    const handleSubmit = async (values: FormValues) => {
        setLoading(true);
        try {
            await api.post(`/servicePricing/create`, { ...values, chefCategoryId: values.chefCategoryId?.value });

            toast.success("Pricing added successfully");
            onSuccess?.();
            off();
        } catch (error: any) {
            console.error(error);
            toast.error(error?.data?.message || "Pricing aleady exists for this chef category");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (on) {
            fetchChefCategories();
        }
    }, [on]);
    return (
        <Modal show={on} onHide={off} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Add pricing to {service?.name}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ values }) => (
                        <Form>
                            <ReusableDropDownSelect
                                label="Select Chef Category"
                                inputType=""
                                name="chefCategoryId"
                                id="chefCategoryId"
                                options={chefCategories}
                            />

                            <div className="mt-3">
                                <ReusableInputs
                                    label="Enter Price"
                                    inputType="number-input"
                                    name="price"
                                    id="price"
                                />
                            </div>


                            <div className="text-end mt-4">
                                <Button
                                    type="submit"
                                    variant="success"
                                    disabled={loading}
                                >
                                    {loading ? "Saving..." : "Save Service Price"}
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </Modal.Body>
        </Modal>
    );
};

export default AddServicePricingModal;