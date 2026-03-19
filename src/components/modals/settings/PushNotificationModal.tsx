import React, { useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import api from '../../../app/api';
import { toast } from 'react-toastify';

interface Props {
  on: boolean;
  off: () => void;
}

const PushNotificationModal: React.FC<Props> = ({ on, off }) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState('all');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!title.trim() || !message.trim()) return toast.error('Provide title and message');
    setSubmitting(true);
    try {
      await api.post('notification/push', { title, message, target });
      toast.success('Push notification queued');
      setTitle('');
      setMessage('');
      off();
    } catch (err) {
      console.error(err);
      toast.error('Failed to send push');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={on} onHide={off} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Send Push Notification</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-2">
            <Form.Label>Title</Form.Label>
            <Form.Control value={title} onChange={(e) => setTitle(e.target.value)} />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Message</Form.Label>
            <Form.Control as="textarea" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} />
          </Form.Group>
          <Form.Group>
            <Form.Label>Target</Form.Label>
            <Form.Control as="select" value={target} onChange={(e) => setTarget(e.target.value)}>
              <option value="all">All users</option>
              <option value="chefs">Chefs</option>
              <option value="customers">Customers</option>
            </Form.Control>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={off}>Cancel</Button>
          <Button type="submit" disabled={submitting}>{submitting ? 'Sending...' : 'Send'}</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default PushNotificationModal;
