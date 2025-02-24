import React, { useState, useEffect } from "react";
import { Table, Button, Form, Modal } from "react-bootstrap";


const EmailManagement = () => {
  const [emails, setEmails] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentEmail, setCurrentEmail] = useState({ name: "", email: "" });

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/projects/emails/all-emails`
      );
      const data = await res.json();
      setEmails(data);
    } catch (err) {
      console.error("Error fetching emails:", err);
    }
  };

  const handleAddClick = () => {
    setCurrentEmail({ name: "", email: "" });
    setShowModal(true);
  };

  const handleEditClick = (email) => {
    setCurrentEmail(email);
    setShowModal(true);
  };

  const handleDeleteEmail = async (id) => {
    if (!window.confirm("Are you sure you want to delete this email?")) return;
    try {
      await fetch(`http://localhost:5000/projects/emails/delete-email/${id}`, {
        method: "DELETE",
      });
      fetchEmails();
    } catch (err) {
      console.error("Error deleting email:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = currentEmail.id ? "PUT" : "POST";
    const url = currentEmail.id
      ? `http://localhost:5000/projects/emails/update-email/${currentEmail.id}`
      : `http://localhost:5000/projects/emails/add-email`;

    try {
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentEmail),
      });
      setShowModal(false);
      fetchEmails();
    } catch (err) {
      console.error("Error saving email:", err);
    }
  };

  return (
    <div className="container mt-4">
      <h3 className="text-center mb-4">Email Management</h3>
      <div className="text-center">
        <Button variant="primary" onClick={handleAddClick}>
          Add Email
        </Button>
      </div>

      <Table bordered striped hover className="mt-3 text-center">
        <thead className="table-dark">
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {emails.map((entry, index) => (
            <tr key={entry.id}>
              <td>{index + 1}</td>
              <td>{entry.name}</td>
              <td>{entry.email}</td>
              <td>
                <Button
                  variant="warning"
                  size="sm"
                  onClick={() => handleEditClick(entry)}
                >
                  Edit
                </Button>{" "}
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteEmail(entry.id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal for Adding & Editing Emails */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {currentEmail.id ? "Edit Email" : "Add Email"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Name"
                value={currentEmail.name}
                onChange={(e) =>
                  setCurrentEmail({ ...currentEmail, name: e.target.value })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter Email"
                value={currentEmail.email}
                onChange={(e) =>
                  setCurrentEmail({ ...currentEmail, email: e.target.value })
                }
                required
              />
            </Form.Group>
            <div className="text-center">
              <Button variant="primary" type="submit">
                {currentEmail.id ? "Update Email" : "Add Email"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default EmailManagement;
