import React, { useState, useEffect } from "react";
import { Modal, Table, Button } from "react-bootstrap";

const ProjectDetailsModal = ({ show, onHide, project, onAddStages }) => {
  const [stages, setStages] = useState([]);

  useEffect(() => {
    if (show) fetchStages();
  }, [show]);

  const fetchStages = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/projects/${project.project_id}/stages`
      );
      const data = await res.json();
      setStages(data);
    } catch (err) {
      console.error("Error fetching project stages:", err);
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{project?.project_name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          <strong>Description:</strong> {project?.description}
        </p>
        <Table bordered striped>
          <thead>
            <tr>
              <th>#</th>
              <th>Stage Name</th>
              <th>Start Date</th>
              <th>End Date</th>
            </tr>
          </thead>
          <tbody>
            {stages.map((stage, index) => (
              <tr key={stage.stage_id}>
                <td>{index + 1}</td>
                <td>{stage.stage_name}</td>
                <td>{stage.start_date || "N/A"}</td>
                <td>{stage.end_date || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        {project?.status !== "Completed" && (
          <Button variant="primary" onClick={onAddStages}>
            Add Stages
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default ProjectDetailsModal;
