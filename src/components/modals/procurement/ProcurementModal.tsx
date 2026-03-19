import React, { useState } from "react";
import { Modal, Button, Form, Row, Col, Spinner } from "react-bootstrap";
import api from "../../../app/api";
import { toast } from "react-toastify";

interface Props {
    show: boolean;
    handleClose: () => void;
    bookingId: string;
    onSuccess?: () => void;
}

interface Item {
    title: string;
    description: string;
    amount: number;
}

const ProcurementModal: React.FC<Props> = ({
    show,
    handleClose,
    bookingId,
    onSuccess,
}) => {
    const [items, setItems] = useState<Item[]>([
        { title: "", description: "", amount: 0 },
    ]);

    const [isProcurementPaid, setIsProcurementPaid] = useState(false);
    const [paymentChannel, setPaymentChannel] = useState("");
    const [paymentReference, setPaymentReference] = useState("");

    const [loading, setLoading] = useState(false);

    // handle item change
    const handleItemChange = (
        index: number,
        field: keyof any,
        value: any
    ) => {
        const updatedItems: any[] = [...items];
        updatedItems[index][field] = value;
        setItems(updatedItems);
    };

    const addItem = () => {
        setItems([...items, { title: "", description: "", amount: 0 }]);
    };

    const removeItem = (index: number) => {
        const updatedItems = items.filter((_, i) => i !== index);
        setItems(updatedItems);
    };

    const handleSubmit = async () => {
        if (!bookingId) {
            toast.error("Booking ID is required");
            return;
        }

        if (items.length === 0) {
            toast.error("At least one item is required");
            return;
        }

        if (items[0].title == "") {
            toast.error("Kindly enter an item information");
            return;
        }

        try {
            setLoading(true);

            const payload: any = {
                bookingId,
                items,
            };

            if (isProcurementPaid) {
                payload.isProcurementPaid = true;
                payload.paymentChannel = paymentChannel;
                payload.paymentReference = paymentReference;
            }

            const res = await api.post("/procurement/create", payload);

            if (res.data.success) {
                toast.success("Procurement created successfully");

                // reset form
                setItems([{ title: "", description: "", amount: 0 }]);
                setIsProcurementPaid(false);
                setPaymentChannel("");
                setPaymentReference("");

                handleClose();
                onSuccess && onSuccess();
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Error creating procurement");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Create Procurement</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form>
                    {/* ITEMS */}
                    <h6 className="mb-3">Items</h6>

                    {items.map((item, index) => (
                        <Row key={index} className="mb-3">
                            <Col md={4}>
                                <Form.Control
                                    placeholder="Item title"
                                    value={item.title}
                                    onChange={(e) =>
                                        handleItemChange(index, "title", e.target.value)
                                    }
                                />
                            </Col>

                            <Col md={3}>
                                <Form.Control
                                    type="text"
                                    placeholder="Description"
                                    value={item.description}
                                    onChange={(e) =>
                                        handleItemChange(index, "description", e.target.value)
                                    }
                                />
                            </Col>

                            <Col md={3}>
                                <Form.Control
                                    type="number"
                                    placeholder="Price"
                                    value={item.amount}
                                    onChange={(e) =>
                                        handleItemChange(index, "amount", Number(e.target.value))
                                    }
                                />
                            </Col>

                            <Col md={2}>
                                <Button
                                    variant="danger"
                                    onClick={() => removeItem(index)}
                                    disabled={items.length === 1}
                                >
                                    Remove
                                </Button>
                            </Col>
                        </Row>
                    ))}

                    <Button variant="secondary" onClick={addItem} className="mb-4">
                        + Add Item
                    </Button>

                    {/* PAYMENT */}
                    {/* <Form.Check
                        type="checkbox"
                        label="Procurement Paid"
                        checked={isProcurementPaid}
                        onChange={(e) => setIsProcurementPaid(e.target.checked)}
                        className="mb-3"
                    /> */}

                    {isProcurementPaid && (
                        <>
                            <Row className="mb-3">
                                <Col>
                                    <Form.Control
                                        placeholder="Payment Channel"
                                        value={paymentChannel}
                                        onChange={(e) => setPaymentChannel(e.target.value)}
                                    />
                                </Col>

                                <Col>
                                    <Form.Control
                                        placeholder="Payment Reference"
                                        value={paymentReference}
                                        onChange={(e) => setPaymentReference(e.target.value)}
                                    />
                                </Col>
                            </Row>
                        </>
                    )}
                </Form>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cancel
                </Button>

                <Button variant="primary" onClick={handleSubmit} disabled={loading}>
                    {loading ? <Spinner size="sm" /> : "Create Procurement"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ProcurementModal;