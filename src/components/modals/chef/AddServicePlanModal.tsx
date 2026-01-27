import React, { useState } from "react";
import { Modal, Button, Row, Col } from "react-bootstrap";
import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import * as Yup from "yup";
import api from "../../../app/api";
import { toast } from "react-toastify";

interface AddServicePlanModalProps {
    on: boolean;
    off: () => void;
    serviceId: string;
    onSuccess?: () => void;
}

/* -------------------- FORM SHAPE -------------------- */
interface FormValues {
    services: {
        title: string;
        description: string;
        price: number;
    }[];
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

const AddServicePlanModal: React.FC<AddServicePlanModalProps> = ({
    on,
    off,
    serviceId,
    onSuccess,
}) => {
    const [loading, setLoading] = useState(false);

    const initialValues: FormValues = {
        services: [
            {
                title: "",
                description: "",
                price: 0,
            },
        ],
    };

    const handleSubmit = async (values: FormValues) => {
        setLoading(true);
        try {
            await api.post(`service/${serviceId}/plans`, {
                services: values.services,
            });

            toast.success("Service plan(s) added successfully");
            onSuccess?.();
            off();
        } catch (error: any) {
            console.error(error);
            toast.error(error?.response?.data?.message || "Failed to add service plans");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={on} onHide={off} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Add Plans</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ values }) => (
                        <Form>
                            <FieldArray name="services">
                                {({ push, remove }) => (
                                    <>
                                        {values.services.map((_, index) => (
                                            <Row
                                                key={index}
                                                className="border rounded p-3 mb-3"
                                            >
                                                <Col md={6} className="mb-2">
                                                    <label className="form-label">Title</label>
                                                    <Field
                                                        name={`services[${index}].title`}
                                                        className="form-control"
                                                        placeholder="Junior Chefs"
                                                    />
                                                    <ErrorMessage
                                                        name={`services[${index}].title`}
                                                        component="div"
                                                        className="text-danger small"
                                                    />
                                                </Col>

                                                <Col md={6} className="mb-2">
                                                    <label className="form-label">Price</label>
                                                    <Field
                                                        type="number"
                                                        name={`services[${index}].price`}
                                                        className="form-control"
                                                        placeholder="30000"
                                                    />
                                                    <ErrorMessage
                                                        name={`services[${index}].price`}
                                                        component="div"
                                                        className="text-danger small"
                                                    />
                                                </Col>

                                                <Col md={12} className="mb-2">
                                                    <label className="form-label">Description</label>
                                                    <Field
                                                        as="textarea"
                                                        rows={2}
                                                        name={`services[${index}].description`}
                                                        className="form-control"
                                                        placeholder="7 days meals"
                                                    />
                                                    <ErrorMessage
                                                        name={`services[${index}].description`}
                                                        component="div"
                                                        className="text-danger small"
                                                    />
                                                </Col>

                                                {values.services.length > 1 && (
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
                                                    price: 0,
                                                })
                                            }
                                        >
                                            + Add Another Plan
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
                                    {loading ? "Saving..." : "Save Service Plan(s)"}
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </Modal.Body>
        </Modal>
    );
};

export default AddServicePlanModal;