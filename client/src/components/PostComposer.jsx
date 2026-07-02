import { SendHorizontal } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '../context/ToastContext.jsx';
import { api } from '../services/api.js';

const initialState = {
  content: '',
  tags: '',
  techStack: '',
  visibility: 'public'
};

const PostComposer = ({ onCreated }) => {
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const { pushToast } = useToast();

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const data = await api.createPost(form);
      onCreated(data.post);
      setForm(initialState);
      pushToast('Post published', 'success');
    } catch (error) {
      pushToast(error.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="composer panel" onSubmit={handleSubmit}>
      <textarea
        value={form.content}
        onChange={(event) => updateField('content', event.target.value)}
        placeholder="Share a build note, question, lesson, or launch update"
        rows={4}
      />
      <div className="composer-grid">
        <input value={form.tags} onChange={(event) => updateField('tags', event.target.value)} placeholder="tags: react, api, mongodb" />
        <input value={form.techStack} onChange={(event) => updateField('techStack', event.target.value)} placeholder="stack: Node.js, Express" />
        <select value={form.visibility} onChange={(event) => updateField('visibility', event.target.value)}>
          <option value="public">Public</option>
          <option value="followers">Followers</option>
        </select>
        <button className="button primary" disabled={submitting || !form.content.trim()}>
          <SendHorizontal size={17} />
          Publish
        </button>
      </div>
    </form>
  );
};

export default PostComposer;
