import React from "react";
import { useAuth } from "../context/AuthContext";

/**
 * PUBLIC_INTERFACE
 * Header component with brand title.
 * Renders a top navigation bar styled with the Royal Purple palette.
 * Shows Google Sign-In when logged out and user avatar/email + Sign out when logged in.
 */
export default function Header() {
  const { user, signInWithGoogle, signOut, loading } = useAuth();

  const avatarUrl =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    null;
  const displayEmail = user?.email || user?.user_metadata?.email || "";
  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || displayEmail || "User";

  return (
    <header className="bg-primary text-white shadow-soft">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">MovieAI</h1>
        <nav className="hidden sm:flex gap-4">
          <a href="#/" className="opacity-90 hover:opacity-100 transition">Home</a>
          <a href="#/search" className="opacity-90 hover:opacity-100 transition">Search</a>
          <a href="#/" className="opacity-90 hover:opacity-100 transition">Trending</a>
          {user ? (
            <>
              <a href="#/favorites" className="opacity-90 hover:opacity-100 transition">Favorites</a>
              <a href="#/register" className="opacity-90 hover:opacity-100 transition">Register</a>
            </>
          ) : null}
        </nav>

        <div className="flex items-center gap-3">
          {!user ? (
            <button
              type="button"
              className="btn-primary"
              onClick={signInWithGoogle}
              disabled={loading}
            >
              Sign in with Google
            </button>
          ) : (
            <div className="flex items-center gap-3">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="h-8 w-8 rounded-full border border-white/40"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center font-semibold">
                  {String(displayName || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <span className="hidden sm:inline text-sm opacity-90">{displayEmail || displayName}</span>
              <button
                type="button"
                className="inline-flex items-center justify-center px-3 py-2 rounded-lgx bg-white text-primary font-semibold shadow-soft hover:opacity-90 transition"
                onClick={signOut}
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
