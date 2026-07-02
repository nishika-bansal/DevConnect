import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import EmptyState from '../components/EmptyState.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import ProjectForm from '../components/ProjectForm.jsx';
import Skeleton from '../components/Skeleton.jsx';
import { api } from '../services/api.js';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [query, setQuery] = useState('');
  const [technology, setTechnology] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (query) params.set('search', query);
        if (technology) params.set('technology', technology);
        const data = await api.getProjects(`?${params.toString()}`);
        setProjects(data.projects);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [query, technology]);

  return (
    <div className="content-grid projects-layout">
      <section className="primary-column">
        <div className="page-header">
          <div>
            <h1>Project Showcase</h1>
            <p>Launches, case studies, repos, and demos.</p>
          </div>
        </div>
        <div className="search-strip panel">
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects" />
          <input value={technology} onChange={(event) => setTechnology(event.target.value)} placeholder="Filter technology" />
        </div>
        {loading ? (
          <Skeleton rows={3} />
        ) : (
          <div className="project-grid">
            {projects.map((project) => (
              <ProjectCard
                project={project}
                key={project._id}
                onDeleted={(id) => setProjects((current) => current.filter((item) => item._id !== id))}
              />
            ))}
          </div>
        )}
        {!loading && projects.length === 0 && <EmptyState title="No projects found" />}
      </section>
      <aside className="side-column">
        <ProjectForm onCreated={(project) => setProjects((current) => [project, ...current])} />
      </aside>
    </div>
  );
};

export default ProjectsPage;
