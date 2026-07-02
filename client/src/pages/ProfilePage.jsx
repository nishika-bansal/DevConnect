import { Camera, Save } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Avatar from '../components/Avatar.jsx';
import PostCard from '../components/PostCard.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import Skeleton from '../components/Skeleton.jsx';
import TagList from '../components/TagList.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { api } from '../services/api.js';

const ProfilePage = () => {
  const { id } = useParams();
  const { user, setUser, refreshMe } = useAuth();
  const { pushToast } = useToast();
  const fileRef = useRef(null);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);

  const isSelf = profile && (`${profile._id}` === `${user._id}` || profile.username === user.username);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const profileData = await api.getProfile(id);
        const [postData, projectData] = await Promise.all([
          api.getFeed(`?author=${profileData.user._id}&limit=10`),
          api.getProjects(`?owner=${profileData.user._id}&limit=10`)
        ]);
        setProfile(profileData.user);
        setForm({
          name: profileData.user.name,
          headline: profileData.user.headline,
          bio: profileData.user.bio,
          location: profileData.user.location || '',
          skills: profileData.user.skills?.join(', ') || '',
          technologies: profileData.user.technologies?.join(', ') || '',
          socials: profileData.user.socials || {}
        });
        setPosts(postData.posts);
        setProjects(projectData.projects);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const saveProfile = async () => {
    try {
      const data = await api.updateProfile(form);
      setProfile(data.user);
      setUser(data.user);
      setEditing(false);
      pushToast('Profile updated', 'success');
    } catch (error) {
      pushToast(error.message, 'error');
    }
  };

  const uploadAvatar = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      const data = await api.uploadProfileImage(formData);
      setProfile(data.user);
      await refreshMe();
      pushToast('Profile picture updated', 'success');
    } catch (error) {
      pushToast(error.message, 'error');
    } finally {
      event.target.value = '';
    }
  };

  if (loading) {
    return <Skeleton rows={4} />;
  }

  return (
    <section className="page-stack">
      <div className="profile-hero panel">
        <div className="profile-avatar-wrap">
          <Avatar user={profile} size="xl" />
          {isSelf && (
            <button className="icon-button camera-button" onClick={() => fileRef.current?.click()} aria-label="Upload profile picture">
              <Camera size={18} />
            </button>
          )}
          <input ref={fileRef} className="hidden-input" type="file" accept="image/*" onChange={uploadAvatar} />
        </div>
        <div className="profile-main">
          {editing ? (
            <div className="profile-edit-grid">
              <input value={form.name} onChange={(event) => updateField('name', event.target.value)} />
              <input value={form.headline} onChange={(event) => updateField('headline', event.target.value)} />
              <input value={form.location} onChange={(event) => updateField('location', event.target.value)} placeholder="Location" />
              <input value={form.skills} onChange={(event) => updateField('skills', event.target.value)} placeholder="Skills" />
              <input value={form.technologies} onChange={(event) => updateField('technologies', event.target.value)} placeholder="Technologies" />
              <textarea value={form.bio} onChange={(event) => updateField('bio', event.target.value)} rows={3} />
              <button className="button primary" onClick={saveProfile}>
                <Save size={17} />
                Save profile
              </button>
            </div>
          ) : (
            <>
              <div className="profile-title-row">
                <div>
                  <h1>{profile.name}</h1>
                  <p>@{profile.username} / {profile.headline}</p>
                </div>
                {isSelf && (
                  <button className="button" onClick={() => setEditing(true)}>
                    Edit
                  </button>
                )}
              </div>
              <p>{profile.bio}</p>
              <TagList items={[...(profile.skills || []), ...(profile.technologies || [])]} />
            </>
          )}
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card panel">
          <span>Posts</span>
          <strong>{profile.postsCount}</strong>
        </div>
        <div className="stat-card panel">
          <span>Projects</span>
          <strong>{profile.projectsCount}</strong>
        </div>
        <div className="stat-card panel">
          <span>Followers</span>
          <strong>{profile.followersCount ?? profile.followers?.length ?? 0}</strong>
        </div>
        <div className="stat-card panel">
          <span>Following</span>
          <strong>{profile.followingCount ?? profile.following?.length ?? 0}</strong>
        </div>
      </div>

      <div className="profile-content-grid">
        <section className="page-stack">
          <h2>Posts</h2>
          {posts.map((post) => (
            <PostCard key={post._id} post={post} onChanged={(next) => setPosts((current) => current.map((item) => (item._id === next._id ? next : item)))} />
          ))}
        </section>
        <section className="page-stack">
          <h2>Projects</h2>
          {projects.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </section>
      </div>
    </section>
  );
};

export default ProfilePage;
