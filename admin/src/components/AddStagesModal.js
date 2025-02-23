import React from "react";
import { Modal, Form, Button } from "react-bootstrap";

const AddStagesModal = ({
  show,
  handleClose,
  availableStages,
  stages,
  selectedStages,
  handleStageSelection,
  customStage,
  handleCustomStageChange,
  handleSubmitStages,
  setCustomStage
}) => {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Add Stages</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
        {(availableStages || []).filter(stage => 
    !stages.some(s => s.stage_id === stage.stage_id && s.status === "completed")
).map(stage => (
  <div key={stage.stage_id} className="mb-3 border p-2 rounded">
    <Form.Check
      type="checkbox"
      label={`${stage.stage_name} - ${stage.description}`}
      onChange={() => handleStageSelection(stage.stage_id, "checkbox", null)}
      checked={!!selectedStages.find(s => s.stage_id === stage.stage_id)}
    />
    <Form.Control
      type="date"
      disabled={!selectedStages.find(s => s.stage_id === stage.stage_id)}
      onChange={(e) => handleStageSelection(stage.stage_id, "date", e.target.value)}
    />
    <Form.Check
      type="radio"
      name={`status-${stage.stage_id}`}
      label="Ongoing"
      checked={selectedStages.find(s => s.stage_id === stage.stage_id)?.status === "ongoing"}
      onChange={() => handleStageSelection(stage.stage_id, "status", "ongoing")}
    />
    <Form.Check
      type="radio"
      name={`status-${stage.stage_id}`}
      label="Completed"
      checked={selectedStages.find(s => s.stage_id === stage.stage_id)?.status === "completed"}
      onChange={() => handleStageSelection(stage.stage_id, "status", "completed")}
    />
  </div>
))}

        </Form>

        <h5 className="mt-3">Add Custom Stage</h5>
        <Form.Control name="name" placeholder="Stage Name" onChange={handleCustomStageChange} className="mb-2" />
        <Form.Control name="description" placeholder="Description" onChange={handleCustomStageChange} className="mb-2" />
        <Form.Control type="date" name="end_date" onChange={handleCustomStageChange} />

        <Form.Check
          type="radio"
          name="customStageStatus"
          label="Ongoing"
          checked={customStage.status === "ongoing"}
          onChange={() => setCustomStage({ ...customStage, status: "ongoing" })}
        />

        <Form.Check
          type="radio"
          name="customStageStatus"
          label="Completed"
          checked={customStage.status === "completed"}
          onChange={() => setCustomStage({ ...customStage, status: "completed" })}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="success" onClick={handleSubmitStages}>Add Selected Stages</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddStagesModal;
