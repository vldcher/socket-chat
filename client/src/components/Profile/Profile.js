import React from "react";
import AuthService from "../../services/auth-service";
import ChatHome from "../../Chat/ChatHome/ChatHome";

const Profile = () => {
    const currentUser = AuthService.getCurrentUser();

    return (
        <div className="container">
            <header className="jumbotron">
                <h5>
                    Welcome <strong>{currentUser.username}</strong>, please to start messaging choose the room:
                </h5>
            </header>

            <ChatHome/>
        </div>
    );
};

export default Profile;
