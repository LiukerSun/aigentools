import React, { useState } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { Layout, Menu, Button, Tooltip } from 'antd'; // Added Button and Tooltip
import { HomeOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons'; // Added LogoutOutlined

const { Sider, Content } = Layout;

interface User {
    username: string;
    role: string;
    id: number;
}

interface MainLayoutProps {
    user: User | null; // User object will be passed from AppShell
    onLogout: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ user, onLogout }) => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [collapsedLeft, setCollapsedLeft] = useState(false);

    return (
        <Layout className="h-full w-full">
       
            {/* Sider: 因为父级有了 h-full，它现在会正确地铺满左侧 */}
            {user && ( // Only show sidebars if user is logged in
                <Sider
                    collapsible
                    collapsed={collapsedLeft}
                    onCollapse={setCollapsedLeft}
                    width={200}
                    collapsedWidth={80}
                    className="bg-gray-200 transition-all duration-200 h-full mr-4 rounded-lg overflow-hidden" // Added border-r
                >
                    <Menu
                        theme="light"
                        mode="inline"
                        selectedKeys={[location.pathname]}
                        className="h-full border-r-0 bg-gray-200"
                        onClick={({ key }) => navigate(key)}
                    >
                        <Menu.Item key="/" icon={<HomeOutlined />}>
                            Home
                        </Menu.Item>
                        {user?.role === 'admin' && (
                            <Menu.Item key="/admin" icon={<SettingOutlined />}>
                                Admin
                            </Menu.Item>
                        )}
                    </Menu>
                </Sider>
            )}

            {/* 右侧区域 */}
            <Layout className="h-full bg-gray-50 rounded-lg">
                {/* Content: 
                    1. 这是唯一应该出现滚动条的地方 (overflow-y-auto)
                    2. 这是一个 Flex 容器
                */}
                <Content className="flex flex-col h-full overflow-y-auto">
                    
                    {/* Padding 包装器 (关键修复):
                        不要把 padding 加在 Content 上，也不要加在 h-full 的元素上。
                        加在这里！如果内容少，flex-grow 会保证它撑开；如果内容多，外层 Content 会滚动。
                    */}
                    <div className="flex flex-col flex-grow p-4">
                        
                        {/* 这里的 div 或者是 Outlet 里的内容容器 */}
                        <div className="flex-1 bg-white p-6 shadow rounded-lg relative"> {/* Added relative */}
                            {user ? <Outlet /> : null}
                            {user && ( // Only show logout button if user is logged in
                                <Tooltip title="Logout" placement="left">
                                    <Button
                                        type="primary"
                                        danger
                                        shape="circle"
                                        icon={<LogoutOutlined />}
                                        onClick={onLogout}
                                        style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 100 }}
                                    />
                                </Tooltip>
                            )}
                        </div>

                    </div>
                    
                    {/* Footer (可选)，放在 Padding 包装器外面或里面均可 */}
                    <div className="p-4 text-center text-gray-500">Footer</div>

                </Content>
            </Layout>
        </Layout>
    );
};

export default MainLayout;