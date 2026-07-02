import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <main className="not-found">
    <span className="brand-mark">DC</span>
    <h1>Page not found</h1>
    <Link className="button primary" to="/">
      Back to feed
    </Link>
  </main>
);

export default NotFoundPage;
