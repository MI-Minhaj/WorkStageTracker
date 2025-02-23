import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Table } from "react-bootstrap";

const Stages = () => {
  const [stages, setStages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentStage, setCurrentStage] = useState({ stage_name: "", description: "" });

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
      await fetch(`http://localhost:5000/stages/delete-stage/${id}`, { method: "DELETE" });
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
    <th className="text-center" style={{ width: "15%" }}>Stage nNumber</th>
      <th className="text-center" style={{ width: "25%" }}>Stage Name</th>
      <th className="text-center" style={{ width: "40%" }}>Description</th>
      <th className="text-center" style={{ width: "20%" }}>Actions</th>
    </tr>
        </thead>
        <tbody>
          {stages.map((stage, index) => (
            <tr key={stage.stage_id}>
              <td>{index + 1}</td>
              <td style={{ wordBreak: "break-word", whiteSpace: "normal", maxWidth: "200px" }}>{stage.stage_name}</td>
              <td style={{ wordBreak: "break-word", whiteSpace: "normal", maxWidth: "200px" }}>{stage.description}</td>
              <td>
                <Button variant="warning" size="sm" onClick={() => handleEditClick(stage)}>
                  Edit
                </Button>{" "}
                <Button variant="danger" size="sm" onClick={() => handleDeleteStage(stage.stage_id)}>
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
          <Modal.Title>{currentStage.stage_id ? "Edit Stage" : "Add Stage"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Stage Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Stage Name"
                value={currentStage.stage_name}
                onChange={(e) => setCurrentStage({ ...currentStage, stage_name: e.target.value })}
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
                onChange={(e) => setCurrentStage({ ...currentStage, description: e.target.value })}
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











// import React, { useEffect, useState } from "react";
// import { Modal, Button } from "react-bootstrap";

// const StageManager = () => {
//   const [stages, setStages] = useState([]);
//   const [newStage, setNewStage] = useState({ stage_name: "", description: "" });
//   const [editingStage, setEditingStage] = useState(null);
//   const [showModal, setShowModal] = useState(false);

//   // Fetch all stages
//   const fetchStages = async () => {
//     try {
//       const res = await fetch("http://localhost:5000/stages/all-stages");
//       const data = await res.json();
//       setStages(data);
//     } catch (err) {
//       console.error("Error fetching stages:", err);
//     }
//   };

//   useEffect(() => {
//     fetchStages();
//   }, []);

//   // Handle adding a new stage
//   const handleAddStage = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await fetch("http://localhost:5000/stages/add-stage", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(newStage),
//       });

//       if (res.ok) {
//         setNewStage({ stage_name: "", description: "" });
//         fetchStages();
//       } else {
//         console.error("Failed to add stage");
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   // Open edit modal
//   const handleEditClick = (stage) => {
//     setEditingStage(stage);
//     setShowModal(true);
//   };

//   // Handle updating a stage
//   const handleUpdateStage = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await fetch(`http://localhost:5000/stages/update-stage/${editingStage.stage_id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(editingStage),
//       });

//       if (res.ok) {
//         setShowModal(false);
//         fetchStages();
//       } else {
//         console.error("Failed to update stage");
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   // Handle deleting a stage
//   const handleDeleteStage = async (stageId) => {
//     if (window.confirm("Are you sure you want to delete this stage?")) {
//       try {
//         const res = await fetch(`http://localhost:5000/stages/delete-stage/${stageId}`, {
//           method: "DELETE",
//         });

//         if (res.ok) {
//           fetchStages();
//         } else {
//           console.error("Failed to delete stage");
//         }
//       } catch (err) {
//         console.error(err);
//       }
//     }
//   };

//   return (
//     <div className="container mt-5">
//       <h3 className="text-center">Stage Management</h3>

//       {/* Stage Table */}
//       <table className="table table-bordered mt-3 text-center">
//   <thead className="table-dark">
//     <tr>
//     <th className="text-center" style={{ width: "15%" }}>Stage nNumber</th>
//       <th className="text-center" style={{ width: "25%" }}>Stage Name</th>
//       <th className="text-center" style={{ width: "40%" }}>Description</th>
//       <th className="text-center" style={{ width: "20%" }}>Actions</th>
//     </tr>
//   </thead>
//   <tbody>
//     {stages.map((stage, index) => (
//       <tr key={stage.stage_id}>
//         <td>{index + 1}</td>
//         <td>{stage.stage_name}</td>
//         <td className="text-start">{stage.description}</td>
//         <td>
//           <button className="btn btn-warning btn-sm me-2" onClick={() => handleEditClick(stage)}>
//             Edit
//           </button>
//           <button className="btn btn-danger btn-sm" onClick={() => handleDeleteStage(stage.stage_id)}>
//             Remove
//           </button>
//         </td>
//       </tr>
//     ))}
//   </tbody>
// </table>


//       {/* Add Stage Form (Below the table) */}
//       <h4 className="text-center mt-4">Add New Stage</h4>
//       <form onSubmit={handleAddStage} className="mb-3 w-50 mx-auto">
//         <input
//           type="text"
//           className="form-control mb-2"
//           placeholder="Stage Name"
//           value={newStage.stage_name}
//           onChange={(e) => setNewStage({ ...newStage, stage_name: e.target.value })}
//           required
//         />
//         <textarea
//           className="form-control mb-2"
//           placeholder="Stage Description"
//           value={newStage.description}
//           onChange={(e) => setNewStage({ ...newStage, description: e.target.value })}
//         />
//         <button type="submit" className="btn btn-primary w-100">Add Stage</button>
//       </form>

//       {/* Edit Stage Modal */}
//       {editingStage && (
//         <Modal show={showModal} onHide={() => setShowModal(false)}>
//           <Modal.Header closeButton>
//             <Modal.Title className="text-center w-100">Edit Stage</Modal.Title>
//           </Modal.Header>
//           <Modal.Body>
//             <form onSubmit={handleUpdateStage}>
//               <input
//                 type="text"
//                 className="form-control mb-2"
//                 value={editingStage.stage_name}
//                 onChange={(e) => setEditingStage({ ...editingStage, stage_name: e.target.value })}
//                 required
//               />
//               <textarea
//                 className="form-control mb-2"
//                 value={editingStage.description}
//                 onChange={(e) => setEditingStage({ ...editingStage, description: e.target.value })}
//               />
//               <Button type="submit" variant="success" className="w-100">Update</Button>
//             </form>
//           </Modal.Body>
//         </Modal>
//       )}
//     </div>
//   );
// };

// export default StageManager;
