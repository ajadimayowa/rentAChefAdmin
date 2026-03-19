import React, { useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import api from '../../../app/api';
import { toast } from 'react-toastify';

interface Props {
  on: boolean;
  off: () => void;
  onDone: () => void;
  initial?: { id?: string; name?: string; description?: string; isActive?: boolean };
}

const AddServiceModal: React.FC<Props> = ({ on, off, onDone, initial }) => {
  const [name, setName] = useState(initial?.name || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [isActive, setIsActive] = useState<boolean>(initial?.isActive ?? true);
  const [submitting, setSubmitting] = useState(false);

  // reset when modal opens/closes
  React.useEffect(() => {
    setName(initial?.name || '');
    setDescription(initial?.description || '');
    setIsActive(initial?.isActive ?? true);
  }, [initial, on]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name.trim()) return toast.error('Please provide a service name');
    setSubmitting(true);
    try {
      if (initial?.id) {
        // edit
        await api.put(`service/${initial.id}`, { name: name.trim(), description, isActive });
        toast.success('Service updated');
      } else {
        await api.post('service/create', { name: name.trim(), description, isActive });
        toast.success('Service added');
      }
      onDone();
      off();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Failed to save service');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={on} onHide={off} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{initial?.id ? 'Edit Service' : 'Add New Service'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-2">
            <Form.Label>Service name</Form.Label>
            <Form.Control value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Full day chef" />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Description</Form.Label>
            <Form.Control as="textarea" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </Form.Group>
          <Form.Group>
            <Form.Check type="checkbox" label="Active" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={off}>Cancel</Button>
          <Button type="submit" disabled={submitting}>{submitting ? (initial?.id ? 'Updating...' : 'Adding...') : (initial?.id ? 'Update Service' : 'Add Service')}</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddServiceModal;
