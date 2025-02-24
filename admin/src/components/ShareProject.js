
import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form } from "react-bootstrap";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import jsPDF from "jspdf";
import "jspdf-autotable";

const ShareProject = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [stages, setStages] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [emails, setEmails] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);

  useEffect(() => {
    fetchProjects();
    fetchEmails();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch("http://localhost:5000/projects/all-projects");
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  const fetchEmails = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/projects/emails/all-emails"
      );
      const data = await res.json();
      setEmails(data);
    } catch (err) {
      console.error("Error fetching emails:", err);
    }
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
    setPdfUrl(null);
  };

  const handleEmailSelect = (email) => {
    setSelectedEmails((prev) => {
      const updatedEmails = prev.includes(email)
        ? prev.filter((e) => e !== email)
        : [...prev, email];

      console.log("Updated Emails:", updatedEmails); // ✅ This will now log the correct array
      return updatedEmails;
    });
  };

  const generatePDF = async () => {
    if (!selectedProject) return;

    const doc = new jsPDF();

    // Set font size for the title
    doc.setFontSize(18);
    const pageWidth = doc.internal.pageSize.width;
    let yPosition = 10; // Initial Y position

    // Wrap long project titles
    const projectTitle = doc.splitTextToSize(
      selectedProject?.project_name || "Project Details",
      pageWidth - 40
    );

    // Calculate X position to center text
    const titleX = (pageWidth - doc.getTextWidth(projectTitle[0])) / 2;

    // Draw each line of the project title centered
    projectTitle.forEach((line, index) => {
      doc.text(line, titleX, yPosition + index * 8);
    });

    // Adjust Y position after title
    yPosition += projectTitle.length * 8;

    // Description (Wrap long descriptions)
    doc.setFontSize(12);
    doc.text("Description:", 10, yPosition);
    yPosition += 5; // Space between label and content

    doc.setFontSize(10);
    const projectDescription = doc.splitTextToSize(
      selectedProject?.description || "No description available.",
      pageWidth - 20
    );
    doc.text(projectDescription, 10, yPosition);
    yPosition += projectDescription.length * 6; // Adjust Y based on text lines

    // Table Header
    yPosition += 10; // Add space before table

    const tableColumn = [
      "#",
      "Stage Name",
      "Description",
      "Start Date",
      "End Date",
      "Status",
    ];
    const tableRows = stages.map((stage, index) => [
      index + 1,
      doc.splitTextToSize(stage.stage_name, 40),
      doc.splitTextToSize(stage.description, 60),
      stage.start_date
        ? new Date(stage.start_date).toLocaleDateString()
        : "N/A",
      stage.end_date ? new Date(stage.end_date).toLocaleDateString() : "N/A",
      stage.status,
    ]);

    // Add Table with Dynamic Y position
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: yPosition,
      theme: "striped",
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 40 },
        2: { cellWidth: 60 },
        3: { cellWidth: 30 },
        4: { cellWidth: 30 },
        5: { cellWidth: 22 },
      },
      didDrawPage: function (data) {
        // Add Page Number at the Bottom Right
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(10);
        doc.text(
          `Page ${pageCount}`,
          pageWidth - 20,
          doc.internal.pageSize.height - 10
        );
      },
    });

    // Generate PDF Blob and URL
    const pdfBlob = doc.output("blob");
    const pdfURL = URL.createObjectURL(pdfBlob);
    setPdfUrl(pdfURL);

    return pdfBlob;
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedEmails([]); // ✅ Clears all selected checkboxes
  };

  const handleSendEmail = async () => {
    if (selectedEmails.length === 0) {
      alert("Please select at least one recipient.");
      return;
    }

    const pdfBlob = await generatePDF();
    if (!pdfBlob) return;

    const formData = new FormData();
    formData.append("emails", JSON.stringify(selectedEmails));
    formData.append(
      "pdf",
      pdfBlob,
      `project_${selectedProject.project_id}.pdf`
    );

    try {
      const res = await fetch("http://localhost:5000/projects/send-email", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        alert("Email sent successfully!");
        handleCloseModal(); // ✅ Clears checkboxes & closes modal
      } else {
        alert("Failed to send email.");
      }
    } catch (err) {
      console.error("Error sending email:", err);
    }
  };

  return (
    <div className="container mt-4">
      <h3 className="text-center mb-3">Project List</h3>
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

      <Table bordered striped hover className="text-center">
        <thead className="table-dark">
          <tr>
            <th>#</th>
            <th>Project Name</th>
            <th>Created Date</th>
            <th>Updated Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {projects
            .filter(
              (proj) => statusFilter === "All" || proj.status === statusFilter
            )
            .map((project, index) => (
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
                    maxWidth: "200px",
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
              </tr>
            ))}
        </tbody>
      </Table>

      <Modal
        show={showDetailsModal}
        onHide={handleCloseModal}
        centered
        size="lg"
        style={{ display: "flex", justifyContent: "flex-start" }}
      >
        <Modal.Header closeButton>
          <Modal.Title
            style={{
              wordBreak: "break-word",
              whiteSpace: "normal",
              maxWidth: "100%", // Wraps based on modal width
            }}
          >
            {selectedProject?.project_name}
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
            <strong>Description:</strong> {selectedProject?.description}
          </p>
          <Table bordered striped>
            <thead>
              <tr>
                <th>#</th>
                <th>Stage Name</th>
                <th>Description</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>status</th>
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
          {pdfUrl && (
            <iframe
              src={pdfUrl}
              width="100%"
              height="400px"
              title="PDF Preview"
            ></iframe>
          )}
          {emails.map((email) => (
            <Form.Check
              key={email.id}
              label={email.email}
              checked={selectedEmails.includes(email.email)}
              onChange={() => handleEmailSelect(email.email)}
            />
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={generatePDF}>
            Generate PDF
          </Button>
          <Button variant="primary" onClick={handleSendEmail}>
            Send PDF via Email
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ShareProject;
