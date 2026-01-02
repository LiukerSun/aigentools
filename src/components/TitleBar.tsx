import React from 'react';
import { Layout, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Header } = Layout;
const { Title } = Typography;

interface TitleBarProps {
  username?: string;
  role?: string;

}

const TitleBar: React.FC<TitleBarProps> = ({ username, role }) => {
  return (
    <Header
      className="flex items-center justify-between px-4 bg-[#30475E] h-9 leading-9 relative z-10" // Tailwind classes
      style={{
        WebkitAppRegion: 'drag', // Keep Electron-specific style for draggable area
      }}
    >
      {/* Removed "aigentools" title to align with user's request */}
      <div style={{ WebkitAppRegion: 'no-drag' }} className="flex-grow">
        {/* Placeholder for potential left-aligned elements if needed in future */}
      </div>

      <div className="flex items-center" style={{ WebkitAppRegion: 'no-drag' }}>
        {username && (
          <span className="text-white text-sm flex items-center">
            <UserOutlined className="mr-1" /> {username} ({role})
          </span>
        )}
      </div>
    </Header>
  );
};

export default TitleBar;