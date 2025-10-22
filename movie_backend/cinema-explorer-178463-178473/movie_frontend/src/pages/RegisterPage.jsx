import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createAttendance } from '../services/backend';

/**
 * PUBLIC_INTERFACE
 * RegisterPage
 * Allows an authenticated user to register attendance by submitting user_id and email.
 */
export default function RegisterPage() {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  if (!user) {
    return <div className="max-w-2xl mx-auto px-4 py-10"><p className="text-secondary">Sign in to register attendance.</p></div>;
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      const payload = { user_id: user.id, email: email || user.email };
      const { error } = await createAttendance(payload);
      if (error) {
        setMessage(`Failed to register: ${error.message}`);
      } else {
        setMessage('Attendance registered successfully!');
      }
    } catch (err) {
      setMessage(`Error: ${err?.message || err}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h3 className="text-2xl font-semibold text-text">Register Attendance</h3>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm text-secondary mb-1">Email</label>
          <input
            id="email"
            type="email"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>
        <input type="hidden" name="user_id" value={user.id} />
        <button
          type="submit"
          className="btn-primary"
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
      {message && <p className="mt-4 text-sm">{message}</p>}
    </div>
  );
}
