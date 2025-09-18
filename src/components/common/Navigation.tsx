import React from "react";
import { Link, useLocation } from "react-router-dom";

const Navigation: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? "active" : "";
  };

  return (
    <nav className="navigation">
      <div className="nav-content">
        <div className="nav-links">
          <Link to="/" className={`nav-link ${isActive("/")}`}>
            设备列表
          </Link>
          <Link
            to="/investment"
            className={`nav-link ${isActive("/investment")}`}
          >
            投资管理
          </Link>
          <Link
            to="/depreciation"
            className={`nav-link ${isActive("/depreciation")}`}
          >
            设备折旧
          </Link>
          <Link
            to="/dimension"
            className={`nav-link ${isActive("/dimension")}`}
          >
            管理维度
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
