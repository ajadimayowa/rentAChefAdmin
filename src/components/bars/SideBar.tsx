import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import './sidebar.css';
import { Image } from "react-bootstrap";
import compLogo from '../../assets/images/rentAChefLogoLight.png';

interface INavBar {
    label:string;
    path:string;
    icon:string;
}

const ReusableSideBar:React.FC<any> = ({ guides = [], title = "Admin Portal" }) => {
    const navigate = useNavigate();

  return (
    <aside className="sidebar bg-dark text-light vh-100 p-3">
      {/* Sidebar Header */}
       <div className="w-100 d-flex justify-content-center">
        <Image src={compLogo} height={150} /> 
       </div>
       <div className="mb-4 text-center">
        <h5 className="fw-bold">{title}</h5>
        <hr className="text-secondary" />
      </div> 
      {/* */}

      {/* Sidebar Links */}
      <ul className="nav nav-pills flex-column gap-1 mt-5">
        {guides.map((item:any) => (
          <li className="nav-item" key={item.id}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `nav-link d-flex align-items-center gap-2 ${
                  isActive ? "active bg-primary" : "text-light"
                }`
              }
            >
              <i className={item.icon}></i>
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}

        <li role="button" onClick={()=>{localStorage.clear(); navigate('/')}} className="d-flex gap-3 p-3 mt-5"><i className="bi bi-box-arrow-left"></i> Logout</li>
      </ul>
    </aside>
  );
};

export default ReusableSideBar;