import React from "react";
import { Form } from "react-bootstrap";

const CustomStageForm = ({ customStage, handleCustomStageChange }) => {
  return (
    <>
      <h5 className="mt-3">Add Custom Stage</h5>
      <Form.Control
        name="name"
        placeholder="Stage Name"
        onChange={handleCustomStageChange}
        className="mb-2"
      />
      <Form.Control
        name="description"
        placeholder="Description"
        onChange={handleCustomStageChange}
        className="mb-2"
      />
      <Form.Control
        type="date"
        name="end_date"
        onChange={handleCustomStageChange}
      />

      {/* Custom Stage Ongoing Checkbox */}
      <Form.Check
        type="radio"
        name="customStageStatus"
        label="Ongoing"
        checked={customStage.status === "ongoing"}
        onChange={() =>
          handleCustomStageChange({
            target: { name: "status", value: "ongoing" },
          })
        }
      />

      {/* Custom Stage Completed Checkbox */}
      <Form.Check
        type="radio"
        name="customStageStatus"
        label="Completed"
        checked={customStage.status === "completed"}
        onChange={() =>
          handleCustomStageChange({
            target: { name: "status", value: "completed" },
          })
        }
      />
    </>
  );
};

export default CustomStageForm;
