import { useOutletContext } from "react-router-dom";

/**
 * Renders a labelled row in the profile card.
 */
function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 border-b border-gray-100 last:border-0">
      <span className="text-sm font-medium text-gray-500">{label}</span>
      <span className="mt-0.5 sm:mt-0 text-sm text-gray-900 font-semibold break-all">
        {value}
      </span>
    </div>
  );
}

/**
 * Home — protected page.
 * Reads `user` from the ProtectedRoute outlet context.
 * No hardcoded user data. No token or user object in localStorage.
 */
export default function Home() {
  const { user } = useOutletContext();

  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      {/* Welcome Banner */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 leading-tight">
          Welcome back, <span className="text-indigo-600">{user.fullName}</span>!
        </h1>
        <p className="mt-1 text-gray-500 text-sm">
          Here&apos;s a summary of your account.
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        {/* Card header */}
        <div className="bg-indigo-600 px-6 py-5 flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold text-white select-none">
            {user.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-white font-semibold text-base">{user.fullName}</p>
            <p className="text-indigo-200 text-sm">{user.email}</p>
          </div>
        </div>

        {/* Card body */}
        <div className="px-6 pb-2">
          <InfoRow label="Full Name" value={user.fullName} />
          <InfoRow label="Email" value={user.email} />
          <InfoRow label="Phone" value={user.phone} />
        </div>
      </div>
    </main>
  );
}
