// CreateProject.js

import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import "../style/CreateProject.css"; // Import CSS file for styling

const CreateProject = () => {
  const [project, setProject] = useState({
    project_name: "",
    description: "",
    // status: "Pending",
    created_at: "",
  });

  const history = useHistory();

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("From Front-end: ", project);

    fetch("http://localhost:5000/projects/project", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...project, status: "Pending" }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Response from backend:", data); // ✅ Debugging

        if (data.success) {
          history.push("/admin-dashboard"); // ✅ Redirect only if success is true
        } else {
          alert("Error: " + (data.error || "Invalid response from server"));
        }
      })
      .catch((error) => {
        console.error("Fetch Error:", error);
        alert("An error occurred. Check console for details.");
      });
  };

  return (
    <div className="create-project-container">
      <div className="create-project-form">
        <h3 className="create-project-heading">Create New Project</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="inputProjectName" className="form-label">
              Project Name
            </label>
            <input
              type="text"
              className="form-control"
              id="inputProjectName"
              placeholder="Enter Project Name"
              value={project.project_name}
              onChange={(e) =>
                setProject({ ...project, project_name: e.target.value })
              }
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="inputDescription" className="form-label">
              Description
            </label>
            <textarea
              className="form-control"
              id="inputDescription"
              placeholder="Enter Project Description"
              value={project.description}
              onChange={(e) =>
                setProject({ ...project, description: e.target.value })
              }
            />
          </div>
          <div className="mb-3">
            <label htmlFor="inputCreatedAt" className="form-label">
              Created At
            </label>
            <input
              type="date"
              className="form-control"
              id="inputCreatedAt"
              value={project.created_at}
              onChange={(e) =>
                setProject({ ...project, created_at: e.target.value })
              }
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Create Project
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;

