import React, { useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import api from '../../../app/api';
import { toast } from 'react-toastify';

interface Props {
  on: boolean;
  off: () => void;
  onDone: () => void;
  initial?: { id?: string; name?: string; description?: string };
}

const AddCategoryModal: React.FC<Props> = ({ on, off, onDone, initial }) => {
  const [name, setName] = useState(initial?.name || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [catPic, setCatPic] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    setName(initial?.name || '');
    setDescription(initial?.description || '');
    setCatPic(null);
  }, [initial, on]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setCatPic(f);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name.trim() || !description.trim()) return toast.error('Please provide name and description');
    setSubmitting(true);
    try {
      if (initial?.id) {
        // update via PUT (controller accepts JSON)
        await api.put(`category/${initial.id}`, { name: name.trim(), description });
        toast.success('Category updated');
      } else {
        // create via multipart/form-data (expects catPic file and fields)
        const fd = new FormData();
        fd.append('name', name.trim());
        fd.append('description', description.trim());
        if (catPic) fd.append('catPic', catPic);
        await api.post('category/create', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Category added');
      }
      onDone();
      off();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={on} onHide={off} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{initial?.id ? 'Edit Category' : 'Add Chef Category'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-2">
            <Form.Label>Category name</Form.Label>
            <Form.Control value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Pastry chef" />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Description</Form.Label>
            <Form.Control as="textarea" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </Form.Group>
          {!initial?.id && (
            <Form.Group>
              <Form.Label>Category image (optional)</Form.Label>
              <Form.Control type="file" accept="image/*" onChange={handleFile} />
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={off}>Cancel</Button>
          <Button type="submit" disabled={submitting}>{submitting ? (initial?.id ? 'Updating...' : 'Adding...') : (initial?.id ? 'Update Category' : 'Add Category')}</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddCategoryModal;
