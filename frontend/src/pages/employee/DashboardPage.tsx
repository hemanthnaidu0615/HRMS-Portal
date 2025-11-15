export const DashboardPage = () => {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Employee Dashboard</h1>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Welcome!</h2>
        {user && (
          <p className="text-gray-600">
            You are logged in as: <span className="font-semibold">{user.email}</span>
          </p>
        )}
        <p className="mt-4 text-gray-500">
          Employee functionality coming soon...
        </p>
      </div>
    </div>
  );
};
