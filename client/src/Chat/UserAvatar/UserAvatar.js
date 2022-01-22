import React from "react";
import "./UserAvatar.css";
import defaultIcon from '../../images/defaultUserIcon.jpg';

const UserAvatar = ({ user }) => {
  return (
      <img
    src={defaultIcon}
    alt={user?.name}
    title={user?.name}
    className={"avatar"}
    />
  );
};

export default UserAvatar;
