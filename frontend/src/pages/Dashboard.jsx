function Dashboard({ user, onLogout }) {
  return (
    <div className="dashboard">

      <div className="dashboard-header">
        <h1>Your Trips</h1>
        <p>Welcome {user.username}</p>
      </div>

      <div className="dashboard-actions">
        <button className="primary-btn">
          + Create New Trip
        </button>

        <button className="secondary-btn">
          Join with Code
        </button>
      </div>

      <div className="dashboard-footer">
        <button onClick={onLogout} className="logout-btn">
          Logout
        </button>
      </div>

    </div>
  );
}

export default Dashboard;