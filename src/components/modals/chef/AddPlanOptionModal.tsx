import React, { useState } from "react";
import { Modal, Button, Row, Col } from "react-bootstrap";
import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import * as Yup from "yup";
import api from "../../../app/api";
import { toast } from "react-toastify";

interface AddServiceOptionModalProps {
    on: boolean;
    off: () => void;
    serviceId: string;
    servicePlanId: string;
    servicePlanTitle: string;
    onSuccess?: () => void;
}

/* -------------------- FORM SHAPE -------------------- */
interface FormValues {
    options: {
        title: string;
        description: string;
        extras: string;
        price: number;
    }[];
}

/* -------------------- VALIDATION -------------------- */
const validationSchema = Yup.object({
    options: Yup.array()
        .of(
            Yup.object({
                title: Yup.string().required("Title is required"),
                description: Yup.string().required("Description is required"),
                extras: Yup.string().required("Extras is required"),
                price: Yup.number()
                    .required("Price is required")
                    .min(0, "Price cannot be negative"),
            })
        )
        .min(1, "At least one option is required"),
});

const AddPlanOptionModal: React.FC<AddServiceOptionModalProps> = ({
    on,
    off,
    serviceId,
    servicePlanId,
    servicePlanTitle,
    onSuccess,
}) => {
    const [loading, setLoading] = useState(false);

    const initialValues: FormValues = {
        options: [
            {
                title: "",
                description: "",
                extras: "",
                price: 0,
            },
        ],
    };

    const handleSubmit = async (values: FormValues) => {
        setLoading(true);
        try {
            await api.post(
                `service/${serviceId}/service-plan/${servicePlanId}/add-options`,
                {
                    options: values.options,
                }
            );

            toast.success("Option(s) added successfully");
            onSuccess?.();
            off();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to add options");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={on} onHide={off} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>
                    Add Options to <strong>{servicePlanTitle}</strong>
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ values }) => (
                        <Form>
                            <FieldArray name="options">
                                {({ push, remove }) => (
                                    <>
                                        {values.options.map((_, index) => (
                                            <Row
                                                key={index}
                                                className="border rounded p-3 mb-3"
                                            >
                                                <Col md={6} className="mb-2">
                                                    <label className="form-label">Title</label>
                                                    <Field
                                                        name={`options[${index}].title`}
                                                        className="form-control"
                                                        placeholder="Breakfast"
                                                    />
                                                    <ErrorMessage
                                                        name={`options[${index}].title`}
                                                        component="div"
                                                        className="text-danger small"
                                                    />
                                                </Col>

                                                <Col md={6} className="mb-2">
                                                    <label className="form-label">Price</label>
                                                    <Field
                                                        type="number"
                                                        name={`options[${index}].price`}
                                                        className="form-control"
                                                    />
                                                    <ErrorMessage
                                                        name={`options[${index}].price`}
                                                        component="div"
                                                        className="text-danger small"
                                                    />
                                                </Col>

                                                <Col md={6} className="mb-2">
                                                    <label className="form-label">Description</label>
                                                    <Field
                                                        name={`options[${index}].description`}
                                                        className="form-control"
                                                        placeholder="Bread & eggs"
                                                    />
                                                </Col>

                                                <Col md={6} className="mb-2">
                                                    <label className="form-label">Extras</label>
                                                    <Field
                                                        name={`options[${index}].extras`}
                                                        className="form-control"
                                                        placeholder="Tea"
                                                    />
                                                </Col>

                                                {values.options.length > 1 && (
                                                    <Col md={12} className="text-end">
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            onClick={() => remove(index)}
                                                        >
                                                            Remove
                                                        </Button>
                                                    </Col>
                                                )}
                                            </Row>
                                        ))}

                                        <Button
                                            variant="primary"
                                            onClick={() =>
                                                push({
                                                    title: "",
                                                    description: "",
                                                    extras: "",
                                                    price: 0,
                                                })
                                            }
                                        >
                                            + Add Another Option
                                        </Button>
                                    </>
                                )}
                            </FieldArray>

                            <div className="text-end mt-4">
                                <Button
                                    type="submit"
                                    variant="success"
                                    disabled={loading}
                                >
                                    {loading ? "Saving..." : "Save Options"}
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </Modal.Body>
        </Modal>
    );
};

export default AddPlanOptionModal;