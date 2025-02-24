import React, { useState, useEffect } from "react";
import { Navbar, Nav, Button } from "react-bootstrap";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import "../style/AdminDashboard.css";
import ShowProjectList from "./ShowProjectList";
import CreateProject from "./CreateProject";
import StageManager from "./StageManager";
import UpdateStages from "./UpdateStages";
import ShareProject from "./ShareProject";
import EmailManagement from "./AddEmail";


const AdminDashboard = ({ setAuth }) => {
  const [name, setName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const getProfile = async () => {
      try {
        const res = await fetch("http://localhost:5000/admin/admin-dashboard", {
          method: "GET",
          headers: { token: localStorage.token },
        });
        const data = await res.json();
        setName(data.name);

        console.log("faslfjsahf;sff------", data);
        setIsLoggedIn(true); // Set isLoggedIn to true upon successful login
      } catch (err) {
        console.error(err.message);
      }
    };

    getProfile();
  }, []);

  const logout = async (e) => {
    e.preventDefault();
    try {
      localStorage.removeItem("token");
      setAuth(false);
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <Router>
      <div className="d-flex flex-column h-100">
        <Navbar bg="light" expand="lg">
          <Navbar.Brand>
            <h4>Admin Dashboard</h4>
            <p>{name}</p>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/admin-dashboard">
                Home
              </Nav.Link>
              <Nav.Link as={Link} to="/create-project">
                Create Project
              </Nav.Link>
              <Nav.Link as={Link} to="/stagemanager">
                Add Stage
              </Nav.Link>
              <Nav.Link as={Link} to="/updateproject">
                Edit
              </Nav.Link>
              <Nav.Link as={Link} to="/shareproject">
                ShareProject
              </Nav.Link>
              <Nav.Link as={Link} to="/emailmanagement">
                EmailManagement
              </Nav.Link>
              <Button variant="light" onClick={logout}>
                Logout
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Navbar>

        <div className="container mt-5">
          <Switch>
            <Route exact path="/admin-dashboard">
              {isLoggedIn && <ShowProjectList />}{" "}
            </Route>
            <Route path="/create-project">
              <CreateProject />
            </Route>

            <Route path="/stagemanager">
              <StageManager />
            </Route>

            <Route path="/updateproject">
              <UpdateStages />
            </Route>

            <Route path="/shareproject">
              <ShareProject />
            </Route>

            <Route path="/emailmanagement">
              <EmailManagement />
            </Route>
          </Switch>
        </div>
      </div>
    </Router>
  );
};

export default AdminDashboard;
