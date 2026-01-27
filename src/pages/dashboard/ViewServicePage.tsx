import {
    Accordion,
    Button,
    Col,
    Row,
    Spinner,
} from "react-bootstrap";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Field, FieldArray, Form, Formik } from "formik";
import api from "../../app/api";
import { toast } from "react-toastify";
import AddServicePlanModal from "../../components/modals/chef/AddServicePlanModal";
import AddPlanOptionModal from "../../components/modals/chef/AddPlanOptionModal";

const ViewServicePage = () => {
    const params: any = useParams();
    const id = params?.id;

    const [loading, setLoading] = useState(false);
    const [loadingPlan, setLoadingPlan] = useState(false);
    const [service, setService] = useState<any>(null);
    const [addNewServOptn, setAddNewServOpt] = useState(false);
    const [addNewServPlnOptn, setAddNewServPlnOpt] = useState(false);
    const [refData,setRefData] = useState(false);

    const navigate = useNavigate();

    const fetchService = async () => {
        setLoading(true);
        try {
            const res = await api.get(`service/${id}`);
            setService(res?.data?.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error("Unable to fetch service");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchService();
    }, [refData]);

    if (loading) {
        return (
            <div className="text-center mt-5">
                <Spinner />
            </div>
        );
    }

    return (
        <>
            <div>
                <h3>{service?.name}</h3>
                <p>{service?.description}</p>

                <Row className="mt-4">
                    <div className="w-100 d-flex align-items-center justify-content-between mb-3">
                        <h5>Plans under this service</h5>
                        <Button onClick={() => setAddNewServOpt(true)}>Add New</Button>
                    </div>

                    {service?.services?.map((srv: any, index: number) => (
                        <Formik
                            key={srv._id}
                            initialValues={{
                                _id: srv._id,
                                title: srv.title,
                                description: srv.description,
                                price: srv.price,
                                options: srv.options || [],
                            }}
                            onSubmit={async (values) => {
                                setLoadingPlan(true);
                                try {
                                    await api.post(`service/${id}/plans/${srv._id}/options`, {
                                        options: values.options,
                                    });
                                    toast.success("Options updated successfully");
                                    fetchService();
                                    setLoadingPlan(false);
                                } catch (error) {
                                    console.error(error);
                                    toast.error("Failed to update options");
                                    setLoadingPlan(false);
                                }
                            }}
                        >
                            {({ values, handleSubmit }) => (
                                <Form onSubmit={handleSubmit} className="mb-3">
                                    <Accordion>
                                        <Accordion.Item eventKey={`${index}`}>
                                            <Accordion.Header>
                                                <div>
                                                    <p className="m-0 fw-semibold">{values.title}</p>
                                                    {/* <small className="text-muted">
                                                    ₦{values.price.toLocaleString()}
                                                </small> */}
                                                </div>
                                            </Accordion.Header>

                                            <Accordion.Body>
                                                {/* Service description */}
                                                <div className="mb-3">
                                                    <p className="fw-bold m-0">Description</p>
                                                    <p className="mb-0">{values.description}</p>
                                                </div>

                                                {/* OPTIONS */}
                                                <FieldArray name="options">
                                                    {({ push, remove }) => (
                                                        <>
                                                            {values.options.map((option: any, optIndex: number) => (
                                                                <Row
                                                                    key={optIndex}
                                                                    className="border rounded p-3 mb-3"
                                                                >
                                                                    <Col md={6} className="mb-2">
                                                                        <label className="form-label">Title</label>
                                                                        <Field
                                                                            name={`options[${optIndex}].title`}
                                                                            className="form-control"
                                                                            placeholder="Breakfast"
                                                                        />
                                                                    </Col>

                                                                    <Col md={6} className="mb-2">
                                                                        <label className="form-label">Price</label>
                                                                        <Field
                                                                            type="number"
                                                                            name={`options[${optIndex}].price`}
                                                                            className="form-control"
                                                                            placeholder="5000"
                                                                        />
                                                                    </Col>

                                                                    <Col md={6} className="mb-2">
                                                                        <label className="form-label">Description</label>
                                                                        <Field
                                                                            name={`options[${optIndex}].description`}
                                                                            className="form-control"
                                                                            placeholder="Bread & eggs"
                                                                        />
                                                                    </Col>

                                                                    <Col md={6} className="mb-2">
                                                                        <label className="form-label">Extras</label>
                                                                        <Field
                                                                            name={`options[${optIndex}].extras`}
                                                                            className="form-control"
                                                                            placeholder="Tea"
                                                                        />
                                                                    </Col>

                                                                    <Col md={12} className="text-end">
                                                                        <Button
                                                                            disabled={values.options.length == 1}
                                                                            variant="outline-danger"
                                                                            size="sm"
                                                                            onClick={() => remove(optIndex)}
                                                                        >
                                                                            Remove Option
                                                                        </Button>
                                                                    </Col>
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
                                                                + Add Option
                                                            </Button>
                                                        </>
                                                    )}
                                                </FieldArray>

                                                <div className="text-end mt-4">
                                                    <Button disabled={loadingPlan} type="submit" variant="success">
                                                        {
                                                            loadingPlan?<Spinner size="sm"/>:'Save Options'
                                                        }
                                                    </Button>
                                                </div>
                                            </Accordion.Body>
                                        </Accordion.Item>
                                    </Accordion>
                                </Form>
                            )}
                        </Formik>
                    ))}
                </Row>
            </div>
            <AddPlanOptionModal
                on={addNewServOptn}
                off={()=>{setAddNewServOpt(!addNewServOptn)}}
                serviceId=""
                servicePlanId=""
                servicePlanTitle=""
                onSuccess={() => console.log('')}
            />

            <AddServicePlanModal
                on={addNewServOptn}
                off={() => { setAddNewServOpt(!addNewServOptn); setRefData(!refData) }}
                serviceId={id}
                onSuccess={() => console.log('')}
            />
        </>
    );
};

export default ViewServicePage;