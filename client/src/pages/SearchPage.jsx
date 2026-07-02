import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import DeveloperCard from '../components/DeveloperCard.jsx';
import PostCard from '../components/PostCard.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import Skeleton from '../components/Skeleton.jsx';
import { api } from '../services/api.js';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ users: [], posts: [], projects: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const search = query ? `?search=${encodeURIComponent(query)}` : '';
        const [users, posts, projects] = await Promise.all([
          api.getUsers(search),
          api.getFeed(search),
          api.getProjects(search)
        ]);
        setResults({ users: users.users, posts: posts.posts, projects: projects.projects });
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [query]);

  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <h1>Search</h1>
          <p>People, posts, projects, skills, and technologies.</p>
        </div>
      </div>
      <div className="search-strip panel">
        <Search size={18} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search DevConnect" autoFocus />
      </div>
      {loading ? (
        <Skeleton rows={3} />
      ) : (
        <div className="search-results">
          <section>
            <h2>Developers</h2>
            <div className="developer-grid compact">
              {results.users.slice(0, 4).map((developer) => (
                <DeveloperCard developer={developer} key={developer._id} />
              ))}
            </div>
          </section>
          <section>
            <h2>Posts</h2>
            {results.posts.slice(0, 4).map((post) => (
              <PostCard post={post} key={post._id} />
            ))}
          </section>
          <section>
            <h2>Projects</h2>
            <div className="project-grid">
              {results.projects.slice(0, 4).map((project) => (
                <ProjectCard project={project} key={project._id} />
              ))}
            </div>
          </section>
        </div>
      )}
    </section>
  );
};

export default SearchPage;
