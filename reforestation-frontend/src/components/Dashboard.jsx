import React from "react";

const Dashboard = ({ user }) => {
  return (
    <div>
      <h2>Welcome to the Dashboard</h2>
      <p>You are logged in as: {user.userType}</p>
    </div>
  );
};

export default Dashboard;
