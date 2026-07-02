import { Bookmark, ExternalLink, Github, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { api } from '../services/api.js';
import Avatar from './Avatar.jsx';
import TagList from './TagList.jsx';

const ProjectCard = ({ project, onDeleted }) => {
  const { user } = useAuth();
  const { pushToast } = useToast();
  const [localProject, setLocalProject] = useState(project);

  const saved = useMemo(
    () => user.savedProjects?.some((item) => `${item._id || item}` === `${localProject._id}`),
    [user.savedProjects, localProject._id]
  );
  const canManage = `${localProject.owner?._id}` === `${user._id}` || user.role === 'admin';
  const cover = localProject.images?.[0]?.url;

  const handleSave = async () => {
    try {
      const data = await api.saveProject(localProject._id);
      setLocalProject((current) => ({
        ...current,
        savedBy: data.saved
          ? [...(current.savedBy || []), user._id]
          : current.savedBy?.filter((id) => `${id}` !== `${user._id}`),
        savesCount: data.savesCount
      }));
      pushToast(data.saved ? 'Project saved' : 'Project removed', 'success');
    } catch (error) {
      pushToast(error.message, 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteProject(localProject._id);
      onDeleted?.(localProject._id);
      pushToast('Project deleted', 'success');
    } catch (error) {
      pushToast(error.message, 'error');
    }
  };

  return (
    <article className="project-card panel">
      {cover ? (
        <img className="project-cover" src={cover} alt={localProject.title} />
      ) : (
        <div className="project-cover generated-cover">{localProject.title.slice(0, 2).toUpperCase()}</div>
      )}
      <div className="project-body">
        <div className="project-title-row">
          <div>
            <h3>{localProject.title}</h3>
            <span className={`status-pill ${localProject.status}`}>{localProject.status}</span>
          </div>
          {canManage && (
            <button className="icon-button ghost" onClick={handleDelete} aria-label="Delete project">
              <Trash2 size={17} />
            </button>
          )}
        </div>
        <p>{localProject.description}</p>
        <TagList items={localProject.techStack} tone="tech" />
        <div className="project-owner">
          <Avatar user={localProject.owner} size="xs" />
          <span>{localProject.owner?.name}</span>
        </div>
        <div className="project-actions">
          {localProject.githubUrl && (
            <a className="icon-text" href={localProject.githubUrl} target="_blank" rel="noreferrer">
              <Github size={17} />
              Repo
            </a>
          )}
          {localProject.liveDemoUrl && (
            <a className="icon-text" href={localProject.liveDemoUrl} target="_blank" rel="noreferrer">
              <ExternalLink size={17} />
              Demo
            </a>
          )}
          <button className={`icon-text ${saved ? 'active' : ''}`} onClick={handleSave}>
            <Bookmark size={17} />
            {localProject.savesCount ?? localProject.savedBy?.length ?? 0}
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProjectCard;
