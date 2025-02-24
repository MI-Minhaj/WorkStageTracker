import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form } from "react-bootstrap";

const ShowProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [stages, setStages] = useState([]);
  const [availableStages, setAvailableStages] = useState([]);
  const [selectedStages, setSelectedStages] = useState([]);
  const [customStage, setCustomStage] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
  });
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddStagesModal, setShowAddStagesModal] = useState(false);
  const [showStageModal, setShowStageModal] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchProjects();
    fetchStages();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [statusFilter, searchQuery, startDate, endDate, projects]);

  const fetchProjects = async () => {
    try {
      const res = await fetch("http://localhost:5000/projects/all-projects");
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  const fetchStages = async () => {
    try {
      const res = await fetch("http://localhost:5000/stages/all-stages");
      const data = await res.json();
      setAvailableStages(data);
    } catch (err) {
      console.error("Error fetching stages:", err);
    }
  };

  const filterProjects = () => {
    const searchLower = searchQuery.toLowerCase();

    const filtered = projects
      .filter((proj) => statusFilter === "All" || proj.status === statusFilter) // Filter by status
      .filter((proj) => {
        // Convert created_at to YYYY-MM-DD format for accurate search
        const formattedDate = new Date(proj.created_at)
          .toISOString()
          .split("T")[0];

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

  const handleProjectClick = async (project) => {
    setSelectedProject(project);
    try {
      const res = await fetch(
        `http://localhost:5000/projects/${project.project_id}/stages`
      );
      const data = await res.json();
      setStages(data);
    } catch (err) {
      console.error("Error fetching project stages:", err);
    }
    setShowDetailsModal(true);
  };

  const handleStageSelection = (stageId, field, value) => {
    setSelectedStages((prev) => {
      const existingStage = prev.find((stage) => stage.stage_id === stageId);

      if (field === "checkbox") {
        return existingStage
          ? prev.filter((stage) => stage.stage_id !== stageId)
          : [
              ...prev,
              {
                stage_id: stageId,
                start_date: "",
                end_date: null,
                status: "pending",
              },
            ];
      }

      if (field === "start_date") {
        return prev.map((stage) =>
          stage.stage_id === stageId ? { ...stage, start_date: value } : stage
        );
      }

      if (field === "end_date") {
        return prev.map((stage) =>
          stage.stage_id === stageId
            ? { ...stage, end_date: value || null }
            : stage
        );
      }

      if (field === "status") {
        return prev.map((stage) =>
          stage.stage_id === stageId
            ? {
                ...stage,
                status: value,
                end_date:
                  value === "completed"
                    ? stage.end_date
                      ? stage.end_date
                      : null
                    : null,
              }
            : stage
        );
      }

      return prev;
    });
  };

  const handleCustomStageChange = (e) => {
    setCustomStage({ ...customStage, [e.target.name]: e.target.value });
  };

  const handleSubmitStages = async () => {
    if (selectedStages.length === 0 && !customStage.name) return;

    let customStageWithId = null;
    if (customStage.name) {
      customStageWithId = {
        stage_id: Math.floor(Math.random() * 1000),
        ...customStage,
      };
    }

    try {
      await fetch("http://localhost:5000/projects/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: selectedProject.project_id,
          stage_ids: selectedStages,
          custom_stage: customStageWithId, // Send custom stage with generated ID
        }),
      });

      setShowAddStagesModal(false);
      handleProjectClick(selectedProject);
    } catch (err) {
      console.error("Error adding stages:", err);
    }
  };

  const handleAddStagesClick = () => {
    setShowAddStagesModal(true);
    setSelectedStages([]); // Clear previous selections
  };

  const handleStageClick = (stage) => {
    console.log("Stage clicked:", stage);
    setSelectedStage(stage);
    setShowStageModal(true);
  };

  const handleStageStatusChange = (status) => {
    setSelectedStage((prev) => ({
      ...prev,
      status,
      start_date:
        status === "ongoing"
          ? new Date().toISOString().split("T")[0]
          : prev.start_date,
      end_date: status === "completed" ? prev.end_date || null : null,
    }));
  };

  const handleDateChange = (field, value) => {
    setSelectedStage((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdateStage = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/projects/update-stage",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            project_id: selectedProject.project_id,
            stage_id: selectedStage.stage_id,
            status: selectedStage.status,
            start_date: selectedStage.start_date,
            end_date: selectedStage.end_date || null, // Ensure null if not selected
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update stage");
      }

      setShowStageModal(false);
      fetchProjects();
    } catch (error) {
      console.error("Error updating stage:", error);
    }
  };

  const completeProject = async (projectId) => {
    if (
      !window.confirm(
        "Are you sure you want to mark this project as Completed?"
      )
    )
      return;

    try {
      const response = await fetch(
        `http://localhost:5000/projects/complete/${projectId}`,
        {
          method: "PUT",
        }
      );

      if (response.ok) {
        console.log(response);
        alert("Project marked as Completed!");
        setShowDetailsModal(false);
        fetchProjects(); // Refresh project list
      } else {
        alert("Failed to complete project!");
      }
    } catch (error) {
      console.error("Error completing project:", error);
      alert("An error occurred!");
    }
  };

  return (
    <div className="container mt-4">
      <h3 className="text-center mb-3">Project List</h3>

      {/* Status Filter */}
      <Form.Select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="mb-3"
      >
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
              <tr
                key={project.project_id}
                onClick={() => handleProjectClick(project)}
                style={{ cursor: "pointer" }}
              >
                <td>{index + 1}</td>
                <td
                  style={{
                    wordBreak: "break-word",
                    whiteSpace: "normal",
                    maxWidth: "300px",
                  }}
                >
                  {project.project_name}
                </td>
                <td>
                  {project.created_at
                    ? new Date(project.created_at).toLocaleDateString()
                    : "N/A"}
                </td>
                <td>
                  {project.updated_at
                    ? new Date(project.updated_at).toLocaleDateString()
                    : "N/A"}
                </td>
                <td>{project.status}</td>
                <td
                  style={{
                    wordBreak: "break-word",
                    whiteSpace: "normal",
                    maxWidth: "200px",
                  }}
                >
                  {project.last_stage || "No Stages"}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p className="text-center mt-3">❌ No projects found</p>
      )}

      {/* centered 
  size="lg"
  style={{ width: "90%", maxWidth: "1000px" }} // Adjust width */}

      {/* Project Details Modal */}
      <Modal
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        centered
        size="lg"
        style={{ display: "flex", justifyContent: "flex-start" }}
      >
        <Modal.Header closeButton>
          <Modal.Title
            style={{
              wordBreak: "break-word",
              whiteSpace: "normal",
              maxWidth: "95%", // Wraps based on modal width
            }}
          >
            {selectedProject?.project_name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
          <p
            style={{
              wordBreak: "break-word",
              whiteSpace: "normal",
              maxWidth: "100%", // Wraps based on modal width
            }}
          >
            <strong>Description:</strong> {selectedProject?.description}
          </p>
          <Table bordered striped>
            <thead>
              <tr>
                <th>#</th>
                <th>Stage Name</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stages.map((stage, index) => (
                <tr
                  key={stage.stage_id}
                  className={
                    stage.status === "pending" || stage.status === "ongoing"
                      ? "clickable-row"
                      : ""
                  }
                  onClick={() =>
                    (stage.status === "pending" ||
                      stage.status === "ongoing") &&
                    handleStageClick(stage)
                  }
                >
                  <td>{index + 1}</td>
                  <td
                    style={{
                      wordBreak: "break-word",
                      whiteSpace: "normal",
                      maxWidth: "200px",
                    }}
                  >
                    {stage.stage_name}
                  </td>
                  <td>
                    {stage.start_date
                      ? new Date(stage.start_date).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td>
                    {stage.end_date
                      ? new Date(stage.end_date).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td>{stage.status}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          {selectedProject?.status !== "Completed" && (
            <>
              <Button variant="primary" onClick={handleAddStagesClick}>
                Add Stages
              </Button>
              <Button
                variant="success"
                onClick={() => completeProject(selectedProject.project_id)}
              >
                Complete Project
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>

      <Modal show={showStageModal} onHide={() => setShowStageModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title
            style={{
              wordBreak: "break-word",
              whiteSpace: "normal",
              maxWidth: "100%", // Wraps based on modal width
            }}
          >
            Update Stage: {selectedStage?.stage_name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p
            style={{
              wordBreak: "break-word",
              whiteSpace: "normal",
              maxWidth: "100%", // Wraps based on modal width
            }}
          >
            <strong>Description:</strong> {selectedStage?.description}
          </p>

          {/* Status Selection */}
          {selectedStage?.status === "pending" && (
            <>
              <Form.Check
                type="radio"
                label="Ongoing"
                checked={selectedStage.status === "ongoing"}
                onChange={() => handleStageStatusChange("ongoing")}
              />
              <Form.Check
                type="radio"
                label="Completed"
                checked={selectedStage.status === "completed"}
                onChange={() => handleStageStatusChange("completed")}
              />
            </>
          )}

          {selectedStage?.status === "ongoing" && (
            <Form.Check
              type="radio"
              label="Completed"
              checked={selectedStage.status === "completed"}
              onChange={() => handleStageStatusChange("completed")}
            />
          )}

          {/* Date Pickers */}
          {selectedStage?.status === "ongoing" && (
            <Form.Group className="mt-3">
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                value={selectedStage.start_date}
                onChange={(e) => handleDateChange("start_date", e.target.value)}
              />
            </Form.Group>
          )}

          {selectedStage?.status === "completed" && (
            <>
              <Form.Group className="mt-3">
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={selectedStage.start_date}
                  onChange={(e) =>
                    handleDateChange("start_date", e.target.value)
                  }
                />
              </Form.Group>
              <Form.Group className="mt-3">
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  value={selectedStage.end_date}
                  onChange={(e) => handleDateChange("end_date", e.target.value)}
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={handleUpdateStage}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showAddStagesModal}
        onHide={() => setShowAddStagesModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Stages</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {availableStages
              .filter(
                (stage) => !stages.some((s) => s.stage_id === stage.stage_id)
              ) // Exclude completed stages
              .map((stage) => {
                const selectedStage = selectedStages.find(
                  (s) => s.stage_id === stage.stage_id
                );
                const status = selectedStage?.status || "pending";

                return (
                  <div key={stage.stage_id} className="mb-3 border p-2 rounded">
                    {/* Stage Checkbox */}
                    <Form.Check
                      type="checkbox"
                      label={
                        <span
                          style={{
                            wordBreak: "break-word",
                            whiteSpace: "normal",
                            maxWidth: "100%",
                            display: "inline-block",
                          }}
                        >
                          {`${stage.stage_name} - ${stage.description}`}
                        </span>
                      }
                      onChange={() =>
                        handleStageSelection(stage.stage_id, "checkbox", null)
                      }
                      checked={!!selectedStage}
                    />

                    {/* Start Date Picker (Always Enabled if Selected) */}
                    <Form.Label className="mt-2">Start Date</Form.Label>
                    <Form.Control
                      type="date"
                      disabled={!selectedStage}
                      onChange={(e) =>
                        handleStageSelection(
                          stage.stage_id,
                          "start_date",
                          e.target.value
                        )
                      }
                    />

                    {/* Ongoing Checkbox (Only one can be selected at a time) */}
                    <Form.Check
                      type="radio"
                      name={`status-${stage.stage_id}`}
                      label="Ongoing"
                      checked={status === "ongoing"}
                      onChange={() =>
                        handleStageSelection(
                          stage.stage_id,
                          "status",
                          "ongoing"
                        )
                      }
                    />

                    {/* Completed Checkbox (Only one can be selected at a time) */}
                    <Form.Check
                      type="radio"
                      name={`status-${stage.stage_id}`}
                      label="Completed"
                      checked={status === "completed"}
                      onChange={() =>
                        handleStageSelection(
                          stage.stage_id,
                          "status",
                          "completed"
                        )
                      }
                    />

                    {/* Completion Date Picker (Only Visible if "Completed" is Checked) */}
                    {status === "completed" && (
                      <>
                        <Form.Label className="mt-2">
                          Completion Date
                        </Form.Label>
                        <Form.Control
                          type="date"
                          onChange={(e) =>
                            handleStageSelection(
                              stage.stage_id,
                              "end_date",
                              e.target.value
                            )
                          }
                        />
                      </>
                    )}
                  </div>
                );
              })}
          </Form>

          <h5 className="mt-3">Add Custom Stage</h5>

          {/* Stage Name Input */}
          <Form.Control
            name="name"
            placeholder="Stage Name"
            value={customStage.name || ""}
            onChange={handleCustomStageChange}
            className="mb-2"
          />

          {/* Description Input */}
          <Form.Control
            as="textarea"
            name="description"
            placeholder="Description"
            value={customStage.description || ""}
            onChange={handleCustomStageChange}
            className="mb-2"
          />

          {/* Status Selection */}
          <Form.Group className="mb-3">
            <Form.Label>Status</Form.Label>
            <div>
              <Form.Check
                type="radio"
                name="status"
                label="Ongoing"
                value="ongoing"
                checked={customStage.status === "ongoing"}
                onChange={handleCustomStageChange}
              />
              <Form.Check
                type="radio"
                name="status"
                label="Completed"
                value="completed"
                checked={customStage.status === "completed"}
                onChange={handleCustomStageChange}
              />
            </div>
          </Form.Group>

          {/* Start Date Field (Always Visible) */}
          <Form.Group className="mb-3">
            <Form.Label>Start Date</Form.Label>
            <Form.Control
              type="date"
              name="start_date"
              value={customStage.start_date || ""}
              onChange={handleCustomStageChange}
            />
          </Form.Group>

          {/* End Date Field (Only Visible if "Completed" is Selected) */}
          {customStage.status === "completed" && (
            <Form.Group className="mb-3">
              <Form.Label>Completion Date</Form.Label>
              <Form.Control
                type="date"
                name="end_date"
                value={customStage.end_date || ""}
                onChange={handleCustomStageChange}
              />
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={handleSubmitStages}>
            Add Selected Stages
          </Button>
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
//   const [filteredProjects, setFilteredProjects] = useState([]);
//   const [selectedProject, setSelectedProject] = useState(null);
//   const [stages, setStages] = useState([]);
//   const [availableStages, setAvailableStages] = useState([]);
//   const [selectedStages, setSelectedStages] = useState([]);
//   const [customStage, setCustomStage] = useState({ name: "", description: "", end_date: "" });
//   const [statusFilter, setStatusFilter] = useState("Pending");
//   const [showDetailsModal, setShowDetailsModal] = useState(false);
//   const [showAddStagesModal, setShowAddStagesModal] = useState(false);
//   const [showStageModal, setShowStageModal] = useState(false);
//   const [selectedStage, setSelectedStage] = useState(null);

//   useEffect(() => {
//     fetchProjects();
//     fetchStages();
//   }, []);

//   useEffect(() => {
//     filterProjects();
//   }, [statusFilter, projects]);

//   const fetchProjects = async () => {
//     try {
//       const res = await fetch("http://localhost:5000/projects/all-projects");
//       const data = await res.json();
//       setProjects(data);
//     } catch (err) {
//       console.error("Error fetching projects:", err);
//     }
//   };

//   const fetchStages = async () => {
//     try {
//       const res = await fetch("http://localhost:5000/stages/all-stages");
//       const data = await res.json();
//       setAvailableStages(data);
//     } catch (err) {
//       console.error("Error fetching stages:", err);
//     }
//   };

//   const filterProjects = () => {
//     if (statusFilter === "All") {
//       setFilteredProjects(projects);
//     } else {
//       setFilteredProjects(projects.filter((proj) => proj.status === statusFilter));
//     }
//   };

//   const handleProjectClick = async (project) => {
//     setSelectedProject(project);
//     try {
//       const res = await fetch(`http://localhost:5000/projects/${project.project_id}/stages`);
//       const data = await res.json();
//       setStages(data);
//     } catch (err) {
//       console.error("Error fetching project stages:", err);
//     }
//     setShowDetailsModal(true);
//   };

//   const handleStageSelection = (stageId, field, value) => {
//     setSelectedStages((prev) => {
//       const existingStage = prev.find(stage => stage.stage_id === stageId);

//       if (field === "checkbox") {
//         return existingStage
//           ? prev.filter(stage => stage.stage_id !== stageId)
//           : [...prev, { stage_id: stageId, start_date: "", end_date: null, status: "pending" }];
//       }

//       if (field === "start_date") {
//         return prev.map(stage =>
//           stage.stage_id === stageId ? { ...stage, start_date: value } : stage
//         );
//       }

//       if (field === "end_date") {
//         return prev.map(stage =>
//           stage.stage_id === stageId ? { ...stage, end_date: value || null } : stage
//         );
//       }

//       if (field === "status") {
//         return prev.map(stage =>
//           stage.stage_id === stageId
//             ? {
//                 ...stage,
//                 status: value,
//                 end_date: value === "completed" ? (stage.end_date ? stage.end_date : null) : null
//               }
//             : stage
//         );
//       }

//       return prev;
//     });
//   };

//   const handleCustomStageChange = (e) => {
//     setCustomStage({ ...customStage, [e.target.name]: e.target.value });
//   };

//   const handleSubmitStages = async () => {
//     if (selectedStages.length === 0 && !customStage.name) return;

//     let customStageWithId = null;
//     if (customStage.name) {
//       customStageWithId = {
//         stage_id: Math.floor(Math.random() * 1000),
//         ...customStage
//       };
//     }

//     try {
//       await fetch("http://localhost:5000/projects/add", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           project_id: selectedProject.project_id,
//           stage_ids: selectedStages,
//           custom_stage: customStageWithId,  // Send custom stage with generated ID
//         }),
//       });

//       setShowAddStagesModal(false);
//       handleProjectClick(selectedProject);
//     } catch (err) {
//       console.error("Error adding stages:", err);
//     }
//   };

//   const handleAddStagesClick = () => {
//     setShowAddStagesModal(true);
//     setSelectedStages([]); // Clear previous selections
//   };

//   const handleStageClick = (stage) => {
//     console.log("Stage clicked:", stage);
//     setSelectedStage(stage);
//     setShowStageModal(true);
//   };

//   const handleStageStatusChange = (status) => {
//     setSelectedStage((prev) => ({
//       ...prev,
//       status,
//       start_date: status === "ongoing" ? new Date().toISOString().split("T")[0] : prev.start_date,
//       end_date: status === "completed" ? prev.end_date || null : null
//     }));
//   };

//   const handleDateChange = (field, value) => {
//     setSelectedStage((prev) => ({ ...prev, [field]: value }));
//   };

//   // const handleUpdateStage = async () => {
//   //   try {
//   //     await axios.put(`/api/project_stages/${selectedStage.stage_id}`, {
//   //       status: selectedStage.status,
//   //       start_date: selectedStage.start_date,
//   //       end_date: selectedStage.end_date
//   //     });
//   //     setShowStageModal(false);
//   //     fetchProjects();
//   //   } catch (error) {
//   //     console.error("Failed to update stage", error);
//   //   }
//   // };

//   // Handle status update in modal
//   const handleUpdateStage = async () => {
//     try {
//       const response = await fetch("http://localhost:5000/projects/update-stage", {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           project_id: selectedProject.project_id,
//           stage_id: selectedStage.stage_id,
//           status: selectedStage.status,
//           start_date: selectedStage.start_date,
//           end_date: selectedStage.end_date || null, // Ensure null if not selected
//         }),
//       });

//       if (!response.ok) {
//         throw new Error("Failed to update stage");
//       }

//       setShowStageModal(false);
//       fetchProjects();
//     } catch (error) {
//       console.error("Error updating stage:", error);
//     }
//   };

//   return (
//     <div className="container mt-4">
//       <h3 className="text-center mb-3">Project List</h3>

//       <div className="mb-3">
//         <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
//           <option value="All">All</option>
//           <option value="Pending">Pending</option>
//           <option value="Ongoing">Ongoing</option>
//           <option value="Completed">Completed</option>
//         </Form.Select>
//       </div>

//       <Table bordered striped hover className="text-center">
//   <thead className="table-dark">
//     <tr>
//       <th>#</th>
//       <th>Project Name</th>
//       <th>Created Date</th>
//       <th>Status</th>
//       <th>Last Stage</th>
//     </tr>
//   </thead>
//   <tbody>
//     {filteredProjects.map((project, index) => (
//       <tr key={project.project_id} onClick={() => handleProjectClick(project)} style={{ cursor: "pointer" }}>
//         <td>{index + 1}</td>
//         <td>{project.project_name}</td>
//         <td>{new Date(project.created_at).toLocaleDateString()}</td>
//         <td>{project.status}</td>
//         <td>{project.last_stage || "No Stages"}</td>  {/* Show only last stage */}
//       </tr>
//     ))}
//   </tbody>
// </Table>

// {/* Project Details Modal */}
// <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)}>
//   <Modal.Header closeButton>
//     <Modal.Title>{selectedProject?.project_name}</Modal.Title>
//   </Modal.Header>
//   <Modal.Body>
//     <p><strong>Description:</strong> {selectedProject?.description}</p>
//     <Table bordered striped>
//       <thead>
//         <tr>
//           <th>#</th>
//           <th>Stage Name</th>
//           <th>Start Date</th>
//           <th>End Date</th>
//         </tr>
//       </thead>
//       <tbody>
//         {stages.map((stage, index) => (
//           <tr
//             key={stage.stage_id}
//             className={stage.status === "pending" || stage.status === "ongoing" ? "clickable-row" : ""}
//             onClick={() => (stage.status === "pending" || stage.status === "ongoing") && handleStageClick(stage)}
//           >
//             <td>{index + 1}</td>
//             <td>{stage.stage_name}</td>
//             <td>{stage.start_date || "N/A"}</td>
//             <td>{stage.end_date || "N/A"}</td>
//           </tr>
//         ))}
//       </tbody>
//     </Table>
//   </Modal.Body>
//   <Modal.Footer>
//     {selectedProject?.status !== "Completed" && (
//       <Button variant="primary" onClick={handleAddStagesClick}>Add Stages</Button>
//     )}
//   </Modal.Footer>
// </Modal>
// <Modal show={showStageModal} onHide={() => setShowStageModal(false)}>
//   <Modal.Header closeButton>
//     <Modal.Title>Update Stage: {selectedStage?.stage_name}</Modal.Title>
//   </Modal.Header>
//   <Modal.Body>
//     <p><strong>Description:</strong> {selectedStage?.description}</p>

//     {/* Status Selection */}
//     {selectedStage?.status === "pending" && (
//       <>
//         <Form.Check
//           type="radio"
//           label="Ongoing"
//           checked={selectedStage.status === "ongoing"}
//           onChange={() => handleStageStatusChange("ongoing")}
//         />
//         <Form.Check
//           type="radio"
//           label="Completed"
//           checked={selectedStage.status === "completed"}
//           onChange={() => handleStageStatusChange("completed")}
//         />
//       </>
//     )}

//     {selectedStage?.status === "ongoing" && (
//       <Form.Check
//         type="radio"
//         label="Completed"
//         checked={selectedStage.status === "completed"}
//         onChange={() => handleStageStatusChange("completed")}
//       />
//     )}

//     {/* Date Pickers */}
//     {selectedStage?.status === "ongoing" && (
//       <Form.Group className="mt-3">
//         <Form.Label>Start Date</Form.Label>
//         <Form.Control
//           type="date"
//           value={selectedStage.start_date}
//           onChange={(e) => handleDateChange("start_date", e.target.value)}
//         />
//       </Form.Group>
//     )}

//     {selectedStage?.status === "completed" && (
//       <>
//         <Form.Group className="mt-3">
//           <Form.Label>Start Date</Form.Label>
//           <Form.Control
//             type="date"
//             value={selectedStage.start_date}
//             onChange={(e) => handleDateChange("start_date", e.target.value)}
//           />
//         </Form.Group>
//         <Form.Group className="mt-3">
//           <Form.Label>End Date</Form.Label>
//           <Form.Control
//             type="date"
//             value={selectedStage.end_date}
//             onChange={(e) => handleDateChange("end_date", e.target.value)}
//           />
//         </Form.Group>
//       </>
//     )}
//   </Modal.Body>
//   <Modal.Footer>
//     <Button variant="success" onClick={handleUpdateStage}>Save Changes</Button>
//   </Modal.Footer>
// </Modal>

//       <Modal show={showAddStagesModal} onHide={() => setShowAddStagesModal(false)}>
//   <Modal.Header closeButton>
//     <Modal.Title>Add Stages</Modal.Title>
//   </Modal.Header>
//   <Modal.Body>
//   <Form>
//   {availableStages
//     .filter(stage => !stages.some(s => s.stage_id === stage.stage_id)) // Exclude completed stages
//     .map(stage => {
//       const selectedStage = selectedStages.find(s => s.stage_id === stage.stage_id);
//       const status = selectedStage?.status || "pending";

//       return (
//         <div key={stage.stage_id} className="mb-3 border p-2 rounded">
//           {/* Stage Checkbox */}
//           <Form.Check
//             type="checkbox"
//             label={`${stage.stage_name} - ${stage.description}`}
//             onChange={() => handleStageSelection(stage.stage_id, "checkbox", null)}
//             checked={!!selectedStage}
//           />

//           {/* Start Date Picker (Always Enabled if Selected) */}
//           <Form.Label className="mt-2">Start Date</Form.Label>
//           <Form.Control
//             type="date"
//             disabled={!selectedStage}
//             onChange={(e) => handleStageSelection(stage.stage_id, "start_date", e.target.value)}
//           />

//           {/* Ongoing Checkbox (Only one can be selected at a time) */}
//           <Form.Check
//             type="radio"
//             name={`status-${stage.stage_id}`}
//             label="Ongoing"
//             checked={status === "ongoing"}
//             onChange={() => handleStageSelection(stage.stage_id, "status", "ongoing")}
//           />

//           {/* Completed Checkbox (Only one can be selected at a time) */}
//           <Form.Check
//             type="radio"
//             name={`status-${stage.stage_id}`}
//             label="Completed"
//             checked={status === "completed"}
//             onChange={() => handleStageSelection(stage.stage_id, "status", "completed")}
//           />

//           {/* Completion Date Picker (Only Visible if "Completed" is Checked) */}
//           {status === "completed" && (
//             <>
//               <Form.Label className="mt-2">Completion Date</Form.Label>
//               <Form.Control
//                 type="date"
//                 onChange={(e) => handleStageSelection(stage.stage_id, "end_date", e.target.value)}
//               />
//             </>
//           )}
//         </div>
//       );
//     })}
// </Form>

//     <h5 className="mt-3">Add Custom Stage</h5>
//     <Form.Control name="name" placeholder="Stage Name" onChange={handleCustomStageChange} className="mb-2" />
//     <Form.Control name="description" placeholder="Description" onChange={handleCustomStageChange} className="mb-2" />
//     <Form.Control type="date" name="end_date" onChange={handleCustomStageChange} />

//     {/* Custom Stage Ongoing Checkbox (Only one can be selected at a time) */}
//     <Form.Check
//       type="radio"
//       name="customStageStatus"
//       label="Ongoing"
//       checked={customStage.status === "ongoing"}
//       onChange={() => setCustomStage({ ...customStage, status: "ongoing" })}
//     />

//     {/* Custom Stage Completed Checkbox (Only one can be selected at a time) */}
//     <Form.Check
//       type="radio"
//       name="customStageStatus"
//       label="Completed"
//       checked={customStage.status === "completed"}
//       onChange={() => setCustomStage({ ...customStage, status: "completed" })}
//     />
//   </Modal.Body>
//   <Modal.Footer>
//     <Button variant="success" onClick={handleSubmitStages}>Add Selected Stages</Button>
//   </Modal.Footer>
// </Modal>

//     </div>
//   );
// };

// export default ShowProjectList;

// import React, { useState, useEffect } from "react";
// import { Table, Button, Form } from "react-bootstrap";
// import ProjectDetailsModal from "./ProjectDetailsModal";
// import AddStagesModal from "./AddStagesModal";

// const ShowProjectList = () => {
//   const [projects, setProjects] = useState([]);
//   const [filteredProjects, setFilteredProjects] = useState([]);
//   const [selectedProject, setSelectedProject] = useState(null);
//   const [statusFilter, setStatusFilter] = useState("Pending");
//   const [showDetailsModal, setShowDetailsModal] = useState(false);
//   const [showAddStagesModal, setShowAddStagesModal] = useState(false);

//   useEffect(() => {
//     fetchProjects();
//   }, []);

//   useEffect(() => {
//     filterProjects();
//   }, [statusFilter, projects]);

//   const fetchProjects = async () => {
//     try {
//       const res = await fetch("http://localhost:5000/projects/all-projects");
//       const data = await res.json();
//       setProjects(data);
//     } catch (err) {
//       console.error("Error fetching projects:", err);
//     }
//   };

//   const filterProjects = () => {
//     setFilteredProjects(
//       statusFilter === "All"
//         ? projects
//         : projects.filter((proj) => proj.status === statusFilter)
//     );
//   };

//   const handleProjectClick = (project) => {
//     setSelectedProject(project);
//     setShowDetailsModal(true);
//   };

//   return (
//     <div className="container mt-4">
//       <h3 className="text-center mb-3">Project List</h3>

//       <div className="mb-3">
//         <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
//           <option value="All">All</option>
//           <option value="Pending">Pending</option>
//           <option value="Ongoing">Ongoing</option>
//           <option value="Completed">Completed</option>
//         </Form.Select>
//       </div>

//       <Table bordered striped hover className="text-center">
//         <thead className="table-dark">
//           <tr>
//             <th>#</th>
//             <th>Project Name</th>
//             <th>Created Date</th>
//             <th>Status</th>
//             <th>Stages</th>
//           </tr>
//         </thead>
//         <tbody>
//           {filteredProjects.map((project, index) => (
//             <tr key={project.project_id} onClick={() => handleProjectClick(project)} style={{ cursor: "pointer" }}>
//               <td>{index + 1}</td>
//               <td>{project.project_name}</td>
//               <td>{new Date(project.created_at).toLocaleDateString()}</td>
//               <td>{project.status}</td>
//               <td>{project.stages?.length > 0 ? project.stages.join(", ") : "No Stages"}</td>
//             </tr>
//           ))}
//         </tbody>
//       </Table>

//       {/* Modals */}
//       {selectedProject && (
//         <>
//           <ProjectDetailsModal
//             show={showDetailsModal}
//             onHide={() => setShowDetailsModal(false)}
//             project={selectedProject}
//             onAddStages={() => setShowAddStagesModal(true)}
//           />
//           <AddStagesModal
//             show={showAddStagesModal}
//             onHide={() => setShowAddStagesModal(false)}
//             project={selectedProject}
//           />
//         </>
//       )}
//     </div>
//   );
// };

// export default ShowProjectList;

// import React, { useState, useEffect } from "react";
// import { Table, Button, Modal, Form } from "react-bootstrap";

// const ShowProjectList = () => {
//   const [projects, setProjects] = useState([]);
//   const [filteredProjects, setFilteredProjects] = useState([]);
//   const [selectedProject, setSelectedProject] = useState(null);
//   const [stages, setStages] = useState([]);
//   const [availableStages, setAvailableStages] = useState([]);
//   const [selectedStages, setSelectedStages] = useState([]);
//   const [customStage, setCustomStage] = useState({ name: "", description: "", end_date: "" });
//   const [statusFilter, setStatusFilter] = useState("Pending");
//   const [showDetailsModal, setShowDetailsModal] = useState(false);
//   const [showAddStagesModal, setShowAddStagesModal] = useState(false);

//   useEffect(() => {
//     fetchProjects();
//     fetchStages();
//   }, []);

//   useEffect(() => {
//     filterProjects();
//   }, [statusFilter, projects]);

//   const fetchProjects = async () => {
//     try {
//       const res = await fetch("http://localhost:5000/projects/all-projects");
//       const data = await res.json();
//       setProjects(data);
//     } catch (err) {
//       console.error("Error fetching projects:", err);
//     }
//   };

//   const fetchStages = async () => {
//     try {
//       const res = await fetch("http://localhost:5000/stages/all-stages");
//       const data = await res.json();
//       setAvailableStages(data);
//     } catch (err) {
//       console.error("Error fetching stages:", err);
//     }
//   };

//   const filterProjects = () => {
//     if (statusFilter === "All") {
//       setFilteredProjects(projects);
//     } else {
//       setFilteredProjects(projects.filter((proj) => proj.status === statusFilter));
//     }
//   };

//   const handleProjectClick = async (project) => {
//     setSelectedProject(project);
//     try {
//       const res = await fetch(`http://localhost:5000/projects/${project.project_id}/stages`);
//       const data = await res.json();
//       setStages(data);
//     } catch (err) {
//       console.error("Error fetching project stages:", err);
//     }
//     setShowDetailsModal(true);
//   };

//   const handleStageSelection = (stageId, field, value) => {
//     setSelectedStages((prev) => {
//       const existingStage = prev.find(stage => stage.stage_id === stageId);

//       if (field === "checkbox") {
//         return existingStage
//           ? prev.filter(stage => stage.stage_id !== stageId)
//           : [...prev, { stage_id: stageId, end_date: "" }];
//       }

//       if (field === "date") {
//         return prev.map(stage =>
//           stage.stage_id === stageId ? { ...stage, end_date: value } : stage
//         );
//       }

//       return prev;
//     });
//   };

//   const handleCustomStageChange = (e) => {
//     setCustomStage({ ...customStage, [e.target.name]: e.target.value });
//   };

//   const handleSubmitStages = async () => {
//     if (selectedStages.length === 0 && !customStage.name) return;

//     // Generate a temporary stage_id for the custom stage
//     let customStageWithId = null;
//     if (customStage.name) {
//       customStageWithId = {
//         stage_id: Math.floor(Math.random() * 1000), // Generates a small number
//         ...customStage
//       };
//     }

//     try {
//       await fetch("http://localhost:5000/projects/add", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           project_id: selectedProject.project_id,
//           stage_ids: selectedStages,
//           custom_stage: customStageWithId,  // Send custom stage with generated ID
//         }),
//       });

//       setShowAddStagesModal(false);
//       handleProjectClick(selectedProject);
//     } catch (err) {
//       console.error("Error adding stages:", err);
//     }
//   };

//   const handleAddStagesClick = () => {
//     setShowAddStagesModal(true);
//     setSelectedStages([]); // Clear previous selections
//   };

//   return (
//     <div className="container mt-4">
//       <h3 className="text-center mb-3">Project List</h3>

//       <div className="mb-3">
//         <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
//           <option value="All">All</option>
//           <option value="Pending">Pending</option>
//           <option value="Ongoing">Ongoing</option>
//           <option value="Completed">Completed</option>
//         </Form.Select>
//       </div>

//       <Table bordered striped hover className="text-center">
//         <thead className="table-dark">
//           <tr>
//             <th>#</th>
//             <th>Project Name</th>
//             <th>Created Date</th>
//             <th>Status</th>
//             <th>Stages</th>
//           </tr>
//         </thead>
//         <tbody>
//           {filteredProjects.map((project, index) => (
//             <tr key={project.project_id} onClick={() => handleProjectClick(project)} style={{ cursor: "pointer" }}>
//               <td>{index + 1}</td>
//               <td>{project.project_name}</td>
//               <td>{new Date(project.created_at).toLocaleDateString()}</td>
//               <td>{project.status}</td>
//               <td>
//                 {project.stages && project.stages.length > 0 ? project.stages.join(", ") : "No Stages"}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </Table>

//       {/* Project Details Modal */}
//       <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)}>
//         <Modal.Header closeButton>
//           <Modal.Title>{selectedProject?.project_name}</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <p><strong>Description:</strong> {selectedProject?.description}</p>
//           <Table bordered striped>
//             <thead>
//               <tr>
//                 <th>#</th>
//                 <th>Stage Name</th>
//                 <th>Start Date</th>
//                 <th>End Date</th>
//               </tr>
//             </thead>
//             <tbody>
//               {stages.map((stage, index) => (
//                 <tr key={stage.stage_id}>
//                   <td>{index + 1}</td>
//                   <td>{stage.stage_name}</td>
//                   <td>{stage.start_date || "N/A"}</td>
//                   <td>{stage.end_date || "N/A"}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </Table>
//         </Modal.Body>
//         <Modal.Footer>
//           {selectedProject?.status !== "Completed" && (
//             <Button variant="primary" onClick={handleAddStagesClick}>Add Stages</Button>
//           )}
//         </Modal.Footer>
//       </Modal>

//       {/* Add Stages Modal */}
//       <Modal show={showAddStagesModal} onHide={() => setShowAddStagesModal(false)}>
//         <Modal.Header closeButton>
//           <Modal.Title>Add Stages</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form>
//             {availableStages
//               .filter(stage => !stages.some(s => s.stage_id === stage.stage_id))
//               .map(stage => (
//                 <div key={stage.stage_id} className="mb-2">
//                   <Form.Check
//                     type="checkbox"
//                     label={`${stage.stage_name} - ${stage.description}`}
//                     onChange={() => handleStageSelection(stage.stage_id, "checkbox", null)}
//                   />
//                   <Form.Control
//                     type="date"
//                     disabled={!selectedStages.some(stage => stage.stage_id === stage.stage_id)}
//                     onChange={(e) => handleStageSelection(stage.stage_id, "date", e.target.value)}
//                   />
//                 </div>
//               ))}
//           </Form>

//           <h5 className="mt-3">Add Custom Stage</h5>
//           <Form.Control name="name" placeholder="Stage Name" onChange={handleCustomStageChange} className="mb-2" />
//           <Form.Control name="description" placeholder="Description" onChange={handleCustomStageChange} className="mb-2" />
//           <Form.Control type="date" name="end_date" onChange={handleCustomStageChange} />
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="success" onClick={handleSubmitStages}>Add Selected Stages</Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default ShowProjectList;

// import React, { useState, useEffect } from "react";
// import { Table, Button, Modal, Form } from "react-bootstrap";

// const ShowProjectList = () => {
//   const [projects, setProjects] = useState([]);
//   const [filteredProjects, setFilteredProjects] = useState([]);
//   const [selectedProject, setSelectedProject] = useState(null);
//   const [stages, setStages] = useState([]);
//   const [availableStages, setAvailableStages] = useState([]);
//   const [selectedStages, setSelectedStages] = useState([]);
//   const [statusFilter, setStatusFilter] = useState("Pending");
//   const [showDetailsModal, setShowDetailsModal] = useState(false);
//   const [showAddStagesModal, setShowAddStagesModal] = useState(false);

//   useEffect(() => {
//     fetchProjects();
//     fetchStages();
//   }, []);

//   useEffect(() => {
//     filterProjects();
//   }, [statusFilter, projects]);

//   const fetchProjects = async () => {
//     try {
//       const res = await fetch("http://localhost:5000/projects/all-projects");
//       const data = await res.json();
//       setProjects(data);
//     } catch (err) {
//       console.error("Error fetching projects:", err);
//     }
//   };

//   const fetchStages = async () => {
//     try {
//       const res = await fetch("http://localhost:5000/stages/all-stages");
//       const data = await res.json();
//       setAvailableStages(data);
//     } catch (err) {
//       console.error("Error fetching stages:", err);
//     }
//   };

//   const filterProjects = () => {
//     if (statusFilter === "All") {
//       setFilteredProjects(projects);
//     } else {
//       setFilteredProjects(projects.filter((proj) => proj.status === statusFilter));
//     }
//   };

//   const handleProjectClick = async (project) => {
//     setSelectedProject(project);
//     try {
//       const res = await fetch(`http://localhost:5000/projects/${project.project_id}/stages`);
//       const data = await res.json();
//       setStages(data);
//     } catch (err) {
//       console.error("Error fetching project stages:", err);
//     }
//     setShowDetailsModal(true);
//   };

//   const handleAddStagesClick = () => {
//     setSelectedStages([]);
//     setShowAddStagesModal(true);
//   };

//   const handleStageSelection = (stageId) => {
//     setSelectedStages((prev) =>
//       prev.includes(stageId) ? prev.filter((id) => id !== stageId) : [...prev, stageId]
//     );
//   };

//   const handleSubmitStages = async () => {
//     if (selectedStages.length === 0) return;
//     try {
//       await fetch("http://localhost:5000/projects/add", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           project_id: selectedProject.project_id,
//           stage_ids: selectedStages,
//         }),
//       });
//       setShowAddStagesModal(false);
//       handleProjectClick(selectedProject);
//     } catch (err) {
//       console.error("Error adding stages:", err);
//     }
//   };

//   return (
//     <div className="container mt-4">
//       <h3 className="text-center mb-3">Project List</h3>

//       <div className="mb-3">
//         <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
//           <option value="All">All</option>
//           <option value="Pending">Pending</option>
//           <option value="Ongoing">Ongoing</option>
//           <option value="Completed">Completed</option>
//         </Form.Select>
//       </div>

//       <Table bordered striped hover className="text-center">
//         <thead className="table-dark">
//           <tr>
//             <th>#</th>
//             <th>Project Name</th>
//             <th>Created Date</th>
//             <th>Status</th>
//             <th>Stages</th>
//           </tr>
//         </thead>
//         <tbody>
//           {filteredProjects.map((project, index) => (
//             <tr key={project.project_id} onClick={() => handleProjectClick(project)} style={{ cursor: "pointer" }}>
//               <td>{index + 1}</td>
//               <td>{project.project_name}</td>
//               <td>{new Date(project.created_at).toLocaleDateString()}</td>
//               <td>{project.status}</td>
//               <td>
//                 {project.stages && project.stages.length > 0 ? project.stages.join(", ") : "No Stages"}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </Table>

//       {/* Project Details Modal */}
//       <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)}>
//         <Modal.Header closeButton>
//           <Modal.Title>{selectedProject?.project_name}</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <p><strong>Description:</strong> {selectedProject?.description}</p>
//           <Table bordered striped>
//             <thead>
//               <tr>
//                 <th>#</th>
//                 <th>Stage Name</th>
//                 <th>Start Date</th>
//                 <th>End Date</th>
//               </tr>
//             </thead>
//             <tbody>
//               {stages.map((stage, index) => (
//                 <tr key={stage.stage_id}>
//                   <td>{index + 1}</td>
//                   <td>{stage.stage_name}</td>
//                   <td>{stage.start_date || "N/A"}</td>
//                   <td>{stage.end_date || "N/A"}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </Table>
//         </Modal.Body>
//         <Modal.Footer>
//           {selectedProject?.status !== "Completed" && (
//             <Button variant="primary" onClick={handleAddStagesClick}>Add Stages</Button>
//           )}
//         </Modal.Footer>
//       </Modal>

//       {/* Add Stages Modal */}
//       <Modal show={showAddStagesModal} onHide={() => setShowAddStagesModal(false)}>
//         <Modal.Header closeButton>
//           <Modal.Title>Add Stages</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form>
//             {availableStages.map((stage) => (
//               <Form.Check
//                 key={stage.stage_id}
//                 type="checkbox"
//                 label={stage.stage_name}
//                 checked={selectedStages.includes(stage.stage_id)}
//                 onChange={() => handleStageSelection(stage.stage_id)}
//               />
//             ))}
//           </Form>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="success" onClick={handleSubmitStages}>Add Selected Stages</Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default ShowProjectList;

//       {/* Project Details Modal */}
// <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)}>
//   <Modal.Header closeButton>
//     <Modal.Title>{selectedProject?.project_name}</Modal.Title>
//   </Modal.Header>
//   <Modal.Body>
//     <p><strong>Description:</strong> {selectedProject?.description}</p>
//     <Table bordered striped>
//       <thead>
//         <tr>
//           <th>#</th>
//           <th>Stage Name</th>
//           <th>Start Date</th>
//           <th>End Date</th>
//           <th>status</th>
//         </tr>
//       </thead>
//       <tbody>
//         {stages.map((stage, index) => (
//           <tr
//       key={stage.stage_id}
//       className={(stage.status === "pending" || stage.status === "ongoing") ? "clickable-row" : ""}
//       onClick={() => {
//         if (stage.status === "pending" || stage.status === "ongoing") {
//           console.log("Clicked stage:", stage);
//           handleStageClick(stage);
//         }
//       }}
//       style={{
//         cursor: (stage.status === "pending" || stage.status === "ongoing") ? "pointer" : "default",
//         backgroundColor: (stage.status === "pending" || stage.status === "ongoing") ? "#f8f9fa" : "transparent"
//       }}
//     >
//             <td>{index + 1}</td>
//             <td>{stage.stage_name}</td>
//             <td>{stage.start_date || "N/A"}</td>
//             <td>{stage.end_date || "N/A"}</td>
//             <td>{stage.status}</td>
//           </tr>
//         ))}
//       </tbody>
//     </Table>
//   </Modal.Body>
//   <Modal.Footer>
//     {selectedProject?.status !== "Completed" && (
//       <Button variant="primary" onClick={handleAddStagesClick}>Add Stages</Button>
//     )}
//   </Modal.Footer>
// </Modal>

// <Modal show={showStageModal} onHide={() => setShowStageModal(false)}>
//   {selectedStage && (
//     <>
//       <Modal.Header closeButton>
//         <Modal.Title>Update Stage: {selectedStage.stage_name}</Modal.Title>
//       </Modal.Header>
//       <Modal.Body>
//         <p><strong>Description:</strong> {selectedStage.description}</p>

//         {/* Status Selection */}
//         {selectedStage.status === "pending" && (
//           <>
//             <Form.Check
//               type="radio"
//               label="Ongoing"
//               checked={selectedStage.status === "ongoing"}
//               onChange={() => handleStageStatusChange("ongoing")}
//             />
//             <Form.Check
//               type="radio"
//               label="Completed"
//               checked={selectedStage.status === "completed"}
//               onChange={() => handleStageStatusChange("completed")}
//             />
//           </>
//         )}

//         {selectedStage.status === "ongoing" && (
//           <Form.Check
//             type="radio"
//             label="Completed"
//             checked={selectedStage.status === "completed"}
//             onChange={() => handleStageStatusChange("completed")}
//           />
//         )}

//         {/* Date Pickers */}
//         {selectedStage.status === "ongoing" && (
//           <Form.Group className="mt-3">
//             <Form.Label>Start Date</Form.Label>
//             <Form.Control
//               type="date"
//               value={selectedStage.start_date}
//               onChange={(e) => handleDateChange("start_date", e.target.value)}
//             />
//           </Form.Group>
//         )}

//         {selectedStage.status === "completed" && (
//           <>
//             <Form.Group className="mt-3">
//               <Form.Label>Start Date</Form.Label>
//               <Form.Control
//                 type="date"
//                 value={selectedStage.start_date}
//                 disabled
//               />
//             </Form.Group>
//             <Form.Group className="mt-3">
//               <Form.Label>End Date</Form.Label>
//               <Form.Control
//                 type="date"
//                 value={selectedStage.end_date}
//                 onChange={(e) => handleDateChange("end_date", e.target.value)}
//               />
//             </Form.Group>
//           </>
//         )}
//       </Modal.Body>
//       <Modal.Footer>
//         <Button variant="success" onClick={handleUpdateStage}>Save Changes</Button>
//       </Modal.Footer>
//     </>
//   )}
// </Modal>
