import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Table } from "react-bootstrap";

const Stages = () => {
  const [stages, setStages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentStage, setCurrentStage] = useState({
    stage_name: "",
    description: "",
  });

  useEffect(() => {
    fetchStages();
  }, []);

  const fetchStages = async () => {
    try {
      const res = await fetch("http://localhost:5000/stages/all-stages");
      const data = await res.json();
      setStages(data);
    } catch (err) {
      console.error("Error fetching stages:", err);
    }
  };

  const handleAddClick = () => {
    setCurrentStage({ stage_name: "", description: "" });
    setShowModal(true);
  };

  const handleEditClick = (stage) => {
    setCurrentStage(stage);
    setShowModal(true);
  };

  const handleDeleteStage = async (id) => {
    if (!window.confirm("Are you sure you want to delete this stage?")) return;
    try {
      await fetch(`http://localhost:5000/stages/delete-stage/${id}`, {
        method: "DELETE",
      });
      fetchStages();
    } catch (err) {
      console.error("Error deleting stage:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = currentStage.stage_id ? "PUT" : "POST";
    const url = currentStage.stage_id
      ? `http://localhost:5000/stages/update-stage/${currentStage.stage_id}`
      : "http://localhost:5000/stages/add-stage";

    try {
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentStage),
      });
      setShowModal(false);
      fetchStages();
    } catch (err) {
      console.error("Error saving stage:", err);
    }
  };

  return (
    <div className="container mt-5">
      <div className="text-center mt-3">
        <Button variant="primary" onClick={handleAddClick}>
          Add Stage
        </Button>
      </div>
      <h3 className="text-center mb-4">Stage Management</h3>

      <table className="table table-bordered mt-3 text-center">
        <thead className="table-dark">
          <tr>
            <th className="text-center" style={{ width: "15%" }}>
              Stage nNumber
            </th>
            <th className="text-center" style={{ width: "25%" }}>
              Stage Name
            </th>
            <th className="text-center" style={{ width: "40%" }}>
              Description
            </th>
            <th className="text-center" style={{ width: "20%" }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {stages.map((stage, index) => (
            <tr key={stage.stage_id}>
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
              <td
                style={{
                  wordBreak: "break-word",
                  whiteSpace: "normal",
                  maxWidth: "200px",
                }}
              >
                {stage.description}
              </td>
              <td>
                <Button
                  variant="warning"
                  size="sm"
                  onClick={() => handleEditClick(stage)}
                >
                  Edit
                </Button>{" "}
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteStage(stage.stage_id)}
                >
                  Remove
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Stage Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {currentStage.stage_id ? "Edit Stage" : "Add Stage"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Stage Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Stage Name"
                value={currentStage.stage_name}
                onChange={(e) =>
                  setCurrentStage({
                    ...currentStage,
                    stage_name: e.target.value,
                  })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter Description"
                value={currentStage.description}
                onChange={(e) =>
                  setCurrentStage({
                    ...currentStage,
                    description: e.target.value,
                  })
                }
                required
              />
            </Form.Group>
            <div className="text-center">
              <Button variant="primary" type="submit">
                {currentStage.stage_id ? "Update Stage" : "Add Stage"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Stages;
