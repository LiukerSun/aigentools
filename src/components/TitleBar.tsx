import React from 'react';
import { Typography } from 'antd'; // 移除 Layout 引用
import { UserOutlined } from '@ant-design/icons';

interface TitleBarProps {
  username?: string;
  role?: string;

}

const TitleBar: React.FC<TitleBarProps> = ({ username, role }) => {
  return (
    <header
      className="flex items-center justify-between px-4 bg-[#30475E] h-12 flex-none relative z-10" // 确保加上 flex-none 防止被挤压
      style={{
        WebkitAppRegion: 'drag', // 保持拖拽功能
      }}
    >
      {/* 左侧：标题 */}
      <div style={{ WebkitAppRegion: 'no-drag' }} className="flex-grow flex items-center">
         <span className="text-white font-bold text-lg select-none">AigenTools</span>
      </div>

      {/* 右侧：用户信息 */}
      <div className="flex items-center" style={{ WebkitAppRegion: 'no-drag' }}>
        {username && (
          <span className="text-white text-sm flex items-center select-none">
            <UserOutlined className="mr-1" /> {username} ({role})
          </span>
        )}
      </div>
    </header>
  );
};

export default TitleBar;