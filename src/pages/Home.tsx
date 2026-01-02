import React from 'react'; // Removed useEffect, useState
// Removed useNavigate, jwtDecode, Layout, Menu, Button, Typography, message, Space
// Removed Icons

const Home = () => {
    // Removed all useEffect, useState, handleLogout, user, navigate logic

    return (
        <div>
            {/* The Layout, Sider, Content are now handled by MainLayout */}
            {/* Only provide the core content for the Home page */}
            <h2 className="text-xl font-semibold mb-4">Welcome to aigentools!</h2>
            <p className="text-gray-700">This is your main dashboard.</p>
            <p className="text-gray-700">You can navigate using the sidebar.</p>
            {/* The user information and logout button are now in the TitleBar */}
        </div>
    );
};

export default Home;
