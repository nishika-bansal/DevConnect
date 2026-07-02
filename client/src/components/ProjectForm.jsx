import { ImagePlus, Plus } from 'lucide-react';
import { useRef, useState } from 'react';
import { useToast } from '../context/ToastContext.jsx';
import { api } from '../services/api.js';

const initialState = {
  title: '',
  description: '',
  techStack: '',
  githubUrl: '',
  liveDemoUrl: '',
  status: 'building',
  images: []
};

const ProjectForm = ({ onCreated }) => {
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const { pushToast } = useToast();

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      const data = await api.uploadProjectImage(formData);
      setForm((current) => ({ ...current, images: [...current.images, data.image] }));
      pushToast('Project image uploaded', 'success');
    } catch (error) {
      pushToast(error.message, 'error');
    } finally {
      event.target.value = '';
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const data = await api.createProject(form);
      onCreated(data.project);
      setForm(initialState);
      pushToast('Project added', 'success');
    } catch (error) {
      pushToast(error.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="project-form panel" onSubmit={handleSubmit}>
      <div className="form-grid two">
        <input value={form.title} onChange={(event) => updateField('title', event.target.value)} placeholder="Project title" />
        <select value={form.status} onChange={(event) => updateField('status', event.target.value)}>
          <option value="planning">Planning</option>
          <option value="building">Building</option>
          <option value="launched">Launched</option>
        </select>
      </div>
      <textarea value={form.description} onChange={(event) => updateField('description', event.target.value)} placeholder="Project description" rows={4} />
      <div className="form-grid two">
        <input value={form.techStack} onChange={(event) => updateField('techStack', event.target.value)} placeholder="React, Node.js, MongoDB" />
        <input value={form.githubUrl} onChange={(event) => updateField('githubUrl', event.target.value)} placeholder="https://github.com/..." />
        <input value={form.liveDemoUrl} onChange={(event) => updateField('liveDemoUrl', event.target.value)} placeholder="https://demo.example.com" />
        <button className="button" type="button" onClick={() => fileInputRef.current?.click()}>
          <ImagePlus size={17} />
          Upload
        </button>
      </div>
      <input ref={fileInputRef} className="hidden-input" type="file" accept="image/*" onChange={handleUpload} />
      <button className="button primary" disabled={submitting || !form.title.trim() || !form.description.trim()}>
        <Plus size={17} />
        Add project
      </button>
    </form>
  );
};

export default ProjectForm;
