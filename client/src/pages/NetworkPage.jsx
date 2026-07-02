import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import DeveloperCard from '../components/DeveloperCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Skeleton from '../components/Skeleton.jsx';
import { api } from '../services/api.js';

const NetworkPage = () => {
  const [developers, setDevelopers] = useState([]);
  const [query, setQuery] = useState('');
  const [skill, setSkill] = useState('');
  const [mode, setMode] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        let data;
        if (mode === 'suggested') {
          data = await api.getSuggestions();
        } else if (mode === 'trending') {
          data = await api.getTrending();
        } else {
          const params = new URLSearchParams();
          if (query) params.set('search', query);
          if (skill) params.set('skill', skill);
          data = await api.getUsers(`?${params.toString()}`);
        }
        setDevelopers(data.users);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [mode, query, skill]);

  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <h1>Developer Network</h1>
          <p>Find builders by profile, skill, and stack.</p>
        </div>
        <div className="segmented">
          {['all', 'suggested', 'trending'].map((item) => (
            <button className={mode === item ? 'active' : ''} onClick={() => setMode(item)} key={item}>
              {item}
            </button>
          ))}
        </div>
      </div>
      {mode === 'all' && (
        <div className="search-strip panel">
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search developers" />
          <input value={skill} onChange={(event) => setSkill(event.target.value)} placeholder="Filter by skill" />
        </div>
      )}
      {loading ? (
        <Skeleton rows={3} />
      ) : (
        <div className="developer-grid">
          {developers.map((developer) => (
            <DeveloperCard developer={developer} key={developer._id} />
          ))}
        </div>
      )}
      {!loading && developers.length === 0 && <EmptyState title="No developers found" />}
    </section>
  );
};

export default NetworkPage;
