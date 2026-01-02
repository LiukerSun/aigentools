import React from 'react'; // Removed useEffect, useState
// Removed useNavigate, jwtDecode, Layout, Button, Typography, Result, Menu, Space
// Removed Icons

const Admin = () => {
    // Removed all useEffect, useState, handleLogout, userRole, navigate logic

    // The unauthorized access check is now handled in MainLayout through routing
    // if (userRole !== 'admin') { ... } is no longer needed here

    return (
        <div>
            {/* The Layout, Sider, Content are now handled by MainLayout */}
            {/* Only provide the core content for the Admin page */}
            <h2 className="text-xl font-semibold mb-4">Admin Dashboard</h2>
            <p className="text-gray-700">This is content only accessible by administrators.</p>
            <p className="text-gray-700">You can manage users or settings here.</p>
        </div>
    );
};

export default Admin;