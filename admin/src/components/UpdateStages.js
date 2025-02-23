import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Card } from "react-bootstrap";

const ShowProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [stages, setStages] = useState([]);
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
  const [updatedProject, setUpdatedProject] = useState({
    project_name: "",
    created_at: "",
    description: "",
    stages: [],
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
      filterProjects();
    }, [statusFilter, searchQuery, startDate, endDate, projects]);

    const filterProjects = () => {
      const searchLower = searchQuery.toLowerCase();
  
      const filtered = projects
        .filter((proj) => statusFilter === "All" || proj.status === statusFilter) // Filter by status
        .filter((proj) => {
          // Convert created_at to YYYY-MM-DD format for accurate search
          const formattedDate = new Date(proj.created_at).toISOString().split("T")[0];
  
          return (
            proj.project_name.toLowerCase().includes(searchLower) || 
            proj.status.toLowerCase().includes(searchLower) ||
            proj.last_stage?.toLowerCase().includes(searchLower) ||
            proj.description?.toLowerCase().includes(searchLower) ||
            formattedDate.includes(searchLower) // Compare using formatted date
          );
        })
        .filter((proj) => {
          const projectDate = new Date(proj.created_at);
          const start = startDate ? new Date(startDate) : null;
          const end = endDate ? new Date(endDate) : null;
  
          if (start) start.setHours(0, 0, 0, 0); // Start at 00:00:00
          if (end) end.setHours(23, 59, 59, 999); // End at 23:59:59
  
          if (start && end) return projectDate >= start && projectDate <= end;
          if (start) return projectDate >= start;
          if (end) return projectDate <= end;
  
          return true;
        }); // Date range filter
  
      setFilteredProjects(filtered);
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch("http://localhost:5000/projects/all-projects");
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

//   const filterProjects = () => {
//     setFilteredProjects(
//       statusFilter === "All"
//         ? projects
//         : projects.filter((proj) => proj.status === statusFilter)
//     );
//   };

  const handleProjectClick = async (project) => {
    setSelectedProject(project);
    try {
      const res = await fetch(`http://localhost:5000/projects/${project.project_id}/stages`);
      const data = await res.json();
      setStages(data);
      setUpdatedProject({
        project_name: project.project_name,
        description: project.description,
        created_at: project.created_at.split("T")[0], // Format date for input
        stages: data.map((stage) => ({
          project_id: stage.project_id,
          stage_id: stage.stage_id,
          stage_name: stage.stage_name,
          start_date: stage.start_date ? stage.start_date.split("T")[0] : "",
          end_date: stage.end_date ? stage.end_date.split("T")[0] : "",
          status: stage.status,
          description: stage.description || "",
        })),
      });
    } catch (err) {
      console.error("Error fetching project stages:", err);
    }
    setShowDetailsModal(true);
  };

  const handleUpdateClick = () => {
    setShowDetailsModal(false);
    setShowUpdateModal(true);
  };

  const handleProjectChange = (e) => {
    setUpdatedProject({ ...updatedProject, [e.target.name]: e.target.value });
  };

  const handleStageChange = (stageId, field, value) => {
    setUpdatedProject((prev) => ({
      ...prev,
      stages: prev.stages.map((stage) =>
        stage.stage_id === stageId ? { ...stage, [field]: value } : stage
      ),
    }));
  };

  const handleUpdateProject = async () => {
    try {
      await fetch(`http://localhost:5000/projects/update/${selectedProject.project_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProject),
      });
      setShowUpdateModal(false);
      fetchProjects();
    } catch (err) {
      console.error("Error updating project:", err);
    }
  };

  return (
    <div className="container mt-4">
          <h3 className="text-center mb-3">Project List</h3>
    
          {/* Status Filter */}
          <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="mb-3">
            <option value="All">All</option>
            <option value="Pending">Pending</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Completed">Completed</option>
          </Form.Select>
    
          {/* Search Input */}
          <Form.Control
            type="text"
            placeholder="Search by name, status, last stage, or description"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-3"
          />
    
          {/* Date Range Filters */}
          <div className="row mb-3">
            <div className="col-md-6">
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            {startDate && (
              <div className="col-md-6">
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                />
              </div>
            )}
          </div>
    
          {/* Projects Table */}
          {filteredProjects.length > 0 ? (
            <Table bordered striped hover className="text-center">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Project Name</th>
                  <th>Created Date</th>
                  <th>Updated Date</th>
                  <th>Status</th>
                  <th>Last Stage</th>
                </tr>
              </thead>
              <tbody>
              {filteredProjects.map((project, index) => (
                    <tr key={project.project_id} onClick={() => handleProjectClick(project)} style={{ cursor: "pointer" }}>
                    <td>{index + 1}</td>
                    <td style={{ wordBreak: "break-word", whiteSpace: "normal", maxWidth: "300px" }}>{project.project_name}</td>
                    <td>{project.created_at ? new Date(project.created_at).toLocaleDateString() : "N/A"}</td>
                <td>{project.updated_at ? new Date(project.updated_at).toLocaleDateString() : "N/A"}</td>
                    <td>{project.status}</td>
                    <td style={{ wordBreak: "break-word", whiteSpace: "normal", maxWidth: "200px" }}>{project.last_stage || "No Stages"}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-center mt-3">❌ No projects found</p>
          )}

      {/* Project Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)}
        centered
        size="lg"
        style={{ display: "flex", justifyContent: "flex-start" }} >
        <Modal.Header closeButton>
          <Modal.Title style={{ 
      wordBreak: "break-word", 
      whiteSpace: "normal", 
      maxWidth: "95%" // Wraps based on modal width
      }}>{selectedProject?.project_name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p style={{ 
      wordBreak: "break-word", 
      whiteSpace: "normal", 
      maxWidth: "100%" // Wraps based on modal width
      }}><strong>Description:</strong> {selectedProject?.description}</p>
          <Table bordered striped>
            <thead>
              <tr>
                <th>#</th>
                <th>Stage Name</th>
                <th>Description</th>
                <th>Start Date</th>
                <th>End Date</th>
              </tr>
            </thead>
            <tbody>
              {stages.map((stage, index) => (
                <tr key={stage.stage_id}>
                  <td>{index + 1}</td>
                  <td style={{ wordBreak: "break-word", whiteSpace: "normal", maxWidth: "200px" }}>{stage.stage_name}</td>
                  <td style={{ wordBreak: "break-word", whiteSpace: "normal", maxWidth: "200px" }}>{stage.description}</td>
                  <td>{stage.start_date ? new Date(stage.start_date).toLocaleDateString() : "N/A"}</td>
                  <td>{stage.end_date ? new Date(stage.end_date).toLocaleDateString() : "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleUpdateClick}>Update Project</Button>
        </Modal.Footer>
      </Modal>

      {/* Update Project Modal */}
      <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)}
        // centered
        // size="lg"
        // style={{ display: "flex", justifyContent: "flex-start" }} 
        >
        <Modal.Header closeButton>
          <Modal.Title>Update Project</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Project Name</Form.Label>
              <Form.Control 
  as={updatedProject.project_name.length > 50 ? "textarea" : "input"}
  rows={updatedProject.project_name.length > 50 ? 3 : 1}
  type="text"
  name="project_name"
  value={updatedProject.project_name}
  onChange={handleProjectChange}
/>

            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Created Date</Form.Label>
              <Form.Control 
                type="date" 
                name="created_at" 
                value={updatedProject.created_at} 
                onChange={handleProjectChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control 
  as={updatedProject.description.length > 50 ? "textarea" : "input"}
  rows={updatedProject.description.length > 50 ? 3 : 1}
  type="text"
  name="description"
  value={updatedProject.description}
  onChange={handleProjectChange}
/>
            </Form.Group>
            <h5>Stages</h5>
            {updatedProject.stages.map((stage) => (
              <Card key={stage.stage_id} className="mb-3 p-3">
                <Form.Group>
                  <Form.Label>Stage Name</Form.Label>
                  <Form.Control 
  as={stage.stage_name.length > 50 ? "textarea" : "input"}
  rows={stage.stage_name.length > 50 ? 3 : 1}
  type="text"
  value={stage.stage_name}
  onChange={(e) => handleStageChange(stage.stage_id, "stage_name", e.target.value)}
/>

                </Form.Group>
                <Form.Group>
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control 
                    type="date" 
                    value={stage.start_date} 
                    onChange={(e) => handleStageChange(stage.stage_id, "start_date", e.target.value)}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>End Date</Form.Label>
                  <Form.Control 
                    type="date" 
                    value={stage.end_date} 
                    onChange={(e) => handleStageChange(stage.stage_id, "end_date", e.target.value)}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Status</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={stage.status} 
                    onChange={(e) => handleStageChange(stage.stage_id, "status", e.target.value)}
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label>Description</Form.Label>
                  <Form.Control 
  as={stage.description.length > 50 ? "textarea" : "input"}
  rows={stage.description.length > 50 ? 3 : 1}
  type="text"
  value={stage.description}
  onChange={(e) => handleStageChange(stage.stage_id, "description", e.target.value)}
/>

                </Form.Group>


              </Card>
            ))}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={handleUpdateProject}>Save Changes</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ShowProjectList;




















// import React, { useState, useEffect } from "react";
// import { Table, Button, Modal, Form } from "react-bootstrap";

// const ShowProjectList = () => {
//   const [projects, setProjects] = useState([]);
//   const [selectedProject, setSelectedProject] = useState(null);
//   const [stages, setStages] = useState([]);
//   const [showUpdateModal, setShowUpdateModal] = useState(false);

//   useEffect(() => {
//     fetch("http://localhost:5000/projects/all-projects")
//       .then((res) => res.json())
//       .then((data) => setProjects(data))
//       .catch((err) => console.error("Error fetching projects:", err));
//   }, []);

//   const handleProjectClick = async (project) => {
//     setSelectedProject(project);
//     try {
//       const res = await fetch(`http://localhost:5000/projects/${project.project_id}/stages`);
//       const data = await res.json();
//       setStages(data);
//     } catch (err) {
//       console.error("Error fetching project stages:", err);
//     }
//     setShowUpdateModal(true);
//   };

//   const handleUpdateProject = async () => {
//     try {
//       await fetch(`http://localhost:5000/projects/update/${selectedProject.project_id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           project_name: selectedProject.project_name,
//           created_at: selectedProject.created_at,
//           stages: stages,
//         }),
//       });

//       setShowUpdateModal(false);
//       window.location.reload(); // Refresh page after update
//     } catch (err) {
//       console.error("Error updating project:", err);
//     }
//   };

//   const handleStageChange = (stageId, field, value) => {
//     setStages((prev) =>
//       prev.map((stage) =>
//         stage.stage_id === stageId ? { ...stage, [field]: value } : stage
//       )
//     );
//   };

//   return (
//     <div className="container mt-4">
//       <h3 className="text-center mb-3">Project List</h3>

//       <Table bordered striped hover className="text-center">
//         <thead className="table-dark">
//           <tr>
//             <th>#</th>
//             <th>Project Name</th>
//             <th>Created Date</th>
//             <th>Action</th>
//           </tr>
//         </thead>
//         <tbody>
//           {projects.map((project, index) => (
//             <tr key={project.project_id}>
//               <td>{index + 1}</td>
//               <td>{project.project_name}</td>
//               <td>{new Date(project.created_at).toLocaleDateString()}</td>
//               <td>
//                 <Button variant="warning" onClick={() => handleProjectClick(project)}>
//                   Update
//                 </Button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </Table>

//       {/* Update Project Modal */}
//       <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)}>
//         <Modal.Header closeButton>
//           <Modal.Title>Update Project</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form>
//             <Form.Group>
//               <Form.Label>Project Name</Form.Label>
//               <Form.Control
//                 type="text"
//                 value={selectedProject?.project_name || ""}
//                 onChange={(e) =>
//                   setSelectedProject({ ...selectedProject, project_name: e.target.value })
//                 }
//               />
//             </Form.Group>
//             <Form.Group className="mt-3">
//               <Form.Label>Created Date</Form.Label>
//               <Form.Control
//                 type="date"
//                 value={selectedProject?.created_at?.split("T")[0] || ""}
//                 onChange={(e) =>
//                   setSelectedProject({ ...selectedProject, created_at: e.target.value })
//                 }
//               />
//             </Form.Group>

//             <h5 className="mt-3">Stages</h5>
//             {stages.map((stage) => (
//               <div key={stage.stage_id} className="mb-2">
//                 <Form.Control
//                   type="text"
//                   value={stage.stage_name}
//                   onChange={(e) => handleStageChange(stage.stage_id, "stage_name", e.target.value)}
//                 />
//                 <Form.Label className="mt-2">Start Date</Form.Label>
//                 <Form.Control
//                   type="date"
//                   value={stage.start_date || ""}
//                   onChange={(e) => handleStageChange(stage.stage_id, "start_date", e.target.value)}
//                 />
//                 <Form.Label className="mt-2">End Date</Form.Label>
//                 <Form.Control
//                   type="date"
//                   value={stage.end_date || ""}
//                   onChange={(e) => handleStageChange(stage.stage_id, "end_date", e.target.value)}
//                 />
//               </div>
//             ))}
//           </Form>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="success" onClick={handleUpdateProject}>Save Changes</Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default ShowProjectList;
