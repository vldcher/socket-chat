import React from "react";
import UserAvatar from "../UserAvatar/UserAvatar";

import "./Users.css";

const Users = ({ users }) => {
  return users.length > 0 ? (
    <div>
      <h2>Online in this room:</h2>
      <ul className="user-list">
        {users.map((user, index) => (
          <li key={index} className="user-box">
            <span>{user.name}</span>
            <UserAvatar user={user}></UserAvatar>
          </li>
        ))}
      </ul>
    </div>
  ) : (
    <div>Nobody online...(</div>
  );
};

export default Users;
