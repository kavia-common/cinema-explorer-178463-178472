import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import SectionCard from './components/SectionCard';
import AddMovieForm from './components/AddMovieForm';
import MoviesList from './components/MoviesList';
import TrendingMovies from './components/TrendingMovies';
import SearchMovies from './pages/SearchMovies';
import FavoritesPage from './pages/FavoritesPage';
import RegisterPage from './pages/RegisterPage';
import AuthCallback from './components/AuthCallback';
import { useEffect, useState } from 'react';

/**
 * PUBLIC_INTERFACE
 * App - main application shell.
 * Renders Header, a welcome hero, Featured and Trending sections with TMDB data,
 * a Supabase-powered "My Movies" section (Add + List), and Footer.
 * Includes a minimal router:
 *  - Home (#/)
 *  - Search (#/search)
 *  - Favorites (#/favorites)
 *  - Register (#/register)
 *  - Supabase OAuth callback (/auth/callback)
 */
function App() {
  const parseRoute = () => {
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    const path = typeof window !== 'undefined' ? window.location.pathname : '/';
    if (path.startsWith('/auth/callback')) return 'auth-callback';
    if (hash.startsWith('#/search')) return 'search';
    if (hash.startsWith('#/favorites')) return 'favorites';
    if (hash.startsWith('#/register')) return 'register';
    return 'home';
  };

  const [route, setRoute] = useState(parseRoute());

  useEffect(() => {
    const onHashChange = () => setRoute(parseRoute());
    const onPopState = () => setRoute(parseRoute());
    window.addEventListener('hashchange', onHashChange);
    window.addEventListener('popstate', onPopState);
    return () => {
      window.removeEventListener('hashchange', onHashChange);
      window.removeEventListener('popstate', onPopState);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (route === 'auth-callback') {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-royal-start to-royal-end">
        <main className="flex-1">
          <AuthCallback />
        </main>
      </div>
    );
  }

  const isHome = route === 'home';

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-royal-start to-royal-end">
      <Header />
      <main className="flex-1">
        {isHome ? (
          <>
            {/* Hero / Welcome Section */}
            <section className="max-w-6xl mx-auto px-4 py-12">
              <div className="text-center">
                <h2 className="text-3xl sm:text-4xl font-bold text-text">Welcome to MovieAI</h2>
                <p className="mt-3 text-secondary">
                  Discover featured picks and explore trending movies powered by an elegant Royal Purple theme.
                </p>
              </div>

              {/* Featured / Trending Cards */}
              <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <SectionCard
                  title="Featured"
                  description="Curated highlights and staff picks."
                  actionText="View Featured"
                />
                <SectionCard
                  title="Trending Movies"
                  description="See what's popular right now."
                  actionText="View Trending"
                  onAction={() => {
                    window.location.hash = '#/';
                    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                  }}
                />
              </div>
            </section>

            {/* Trending Movies Section (TMDB) */}
            <section className="bg-surface">
              <div className="max-w-6xl mx-auto px-4 py-10">
                <h3 className="text-2xl font-semibold text-text">Trending Movies</h3>
                <TrendingMovies period="day" />
              </div>
            </section>

            {/* Backend Saved Movies Section (from /api/movies) */}
            <section className="bg-background">
              <div className="max-w-6xl mx-auto px-4 py-10">
                <h3 className="text-2xl font-semibold text-text">Saved Movies (Backend)</h3>
                <p className="text-secondary mt-1">Data fetched from Flask + Supabase.</p>
                <TrendingMovies useBackend />
              </div>
            </section>

            {/* Supabase - My Movies Section */}
            <section className="bg-background">
              <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
                <h3 className="text-2xl font-semibold text-text">My Movies (Supabase)</h3>
                <AddMovieForm />
                <MoviesList />
              </div>
            </section>
          </>
        ) : route === 'search' ? (
          <SearchMovies />
        ) : route === 'favorites' ? (
          <FavoritesPage />
        ) : route === 'register' ? (
          <RegisterPage />
        ) : (
          <SearchMovies />
        )}
      </main>
      <Footer />
    </div>
  );
}

export default App;
