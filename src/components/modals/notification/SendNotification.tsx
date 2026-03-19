import React, { useState } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import api from "../../../app/api";
import { toast } from "react-toastify";

interface Props {
  show: boolean;
  handleClose: () => void;
  userId: string;
  onSuccess?: () => void;
}

const notificationTypes = [
  'booking-confirmation',
  'booking-cancellation',
  'chef-application-status',
  'general-announcement',
  'procurement-update',
  'menu-update',
  'service-update',
  'payment-receipt',
  'feedback-request',
  'event-invitation',
  'system-alert',
];

const SendNotification: React.FC<Props> = ({ show, handleClose, userId, onSuccess }) => {
  const [type, setType] = useState<string>("general-announcement");
  const [title, setTitle] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (!userId) {
      toast.error("User ID is required");
      return;
    }

    if (!title || !message) {
      toast.error("Please provide a title and message");
      return;
    }

    try {
      setLoading(true);
      const payload = { userId, type, title, message };

      const res = await api.post('/notification/create', payload);

      if (res?.data?.success) {
        toast.success('Notification sent');
        setTitle('');
        setMessage('');
        handleClose();
        onSuccess && onSuccess();
      } else {
        toast.error(res?.data?.message || 'Failed to send notification');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error sending notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Send Notification</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Type</Form.Label>
            <Form.Control as="select" value={type} onChange={(e) => setType(e.target.value)}>
              {notificationTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Form.Control>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control value={title} onChange={(e) => setTitle(e.target.value)} />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Message</Form.Label>
            <Form.Control as="textarea" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={loading}>
          Cancel
        </Button>

        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? <Spinner size="sm" /> : 'Send'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SendNotification;
