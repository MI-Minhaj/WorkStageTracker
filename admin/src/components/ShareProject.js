// import React, { useState, useEffect } from "react";
// import { Table, Button, Modal, Form } from "react-bootstrap";
// import { PDFDocument, rgb } from "pdf-lib";
// import { saveAs } from "file-saver";

// const ShareProject = () => {
//   const [projects, setProjects] = useState([]);
//   const [selectedProject, setSelectedProject] = useState(null);
//   const [stages, setStages] = useState([]);
//   const [statusFilter, setStatusFilter] = useState("All");
//   const [showDetailsModal, setShowDetailsModal] = useState(false);
//   const [email, setEmail] = useState("");

//   useEffect(() => {
//     fetchProjects();
//   }, []);

//   // Fetch all projects
//   const fetchProjects = async () => {
//     try {
//       const res = await fetch("http://localhost:5000/projects/all-projects");
//       const data = await res.json();
//       setProjects(data);
//     } catch (err) {
//       console.error("Error fetching projects:", err);
//     }
//   };

//   // Fetch project details and stages
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

//   // Generate PDF in the frontend
//   const generatePDF = async () => {
//     if (!selectedProject) return;

//     const pdfDoc = await PDFDocument.create();
//     const page = pdfDoc.addPage([600, 800]); // A4 size
//     const { width, height } = page.getSize();
//     const fontSize = 14;

//     page.drawText(`Project: ${selectedProject.project_name}`, { x: 50, y: height - 50, size: 20, color: rgb(0, 0, 1) });
//     page.drawText(`Description: ${selectedProject.description}`, { x: 50, y: height - 80, size: fontSize });

//     let yPos = height - 120;
//     page.drawText("Stages:", { x: 50, y: yPos, size: 16, color: rgb(1, 0, 0) });

//     stages.forEach((stage, index) => {
//       yPos -= 30;
//       page.drawText(`${index + 1}. ${stage.stage_name}`, { x: 50, y: yPos, size: fontSize });
//       page.drawText(`Start Date: ${stage.start_date || "N/A"}`, { x: 200, y: yPos, size: fontSize });
//       page.drawText(`End Date: ${stage.end_date || "N/A"}`, { x: 350, y: yPos, size: fontSize });
//       page.drawText(`Status: ${stage.status}`, { x: 500, y: yPos, size: fontSize });
//     });

//     const pdfBytes = await pdfDoc.save();
//     return new Blob([pdfBytes], { type: "application/pdf" });
//   };

//   // Send PDF to backend for emailing
//   const handleSendEmail = async () => {
//     if (!email) {
//       alert("Please enter an email address!");
//       return;
//     }

//     const pdfBlob = await generatePDF();
//     if (!pdfBlob) return;

//     const formData = new FormData();
//     formData.append("email", email);
//     formData.append("pdf", pdfBlob, `project_${selectedProject.project_id}.pdf`);

//     try {
//       const res = await fetch("http://localhost:5000/projects/send-email", {
//         method: "POST",
//         body: formData,
//       });

//       const data = await res.json();
//       if (data.success) {
//         alert("Email sent successfully!");
//       } else {
//         alert("Failed to send email.");
//       }
//     } catch (err) {
//       console.error("Error sending email:", err);
//     }
//   };

//   return (
//     <div className="container mt-4">
//       <h3 className="text-center mb-3">Project List</h3>

//       {/* Status Filter Dropdown */}
//       <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="mb-3">
//         <option value="All">All</option>
//         <option value="Pending">Pending</option>
//         <option value="Ongoing">Ongoing</option>
//         <option value="Completed">Completed</option>
//       </Form.Select>

//       {/* Projects Table */}
//       <Table bordered striped hover className="text-center">
//         <thead className="table-dark">
//           <tr>
//             <th>#</th>
//             <th>Project Name</th>
//             <th>Created Date</th>
//             <th>Status</th>
//           </tr>
//         </thead>
//         <tbody>
//           {projects
//             .filter((proj) => statusFilter === "All" || proj.status === statusFilter)
//             .map((project, index) => (
//               <tr key={project.project_id} onClick={() => handleProjectClick(project)} style={{ cursor: "pointer" }}>
//                 <td>{index + 1}</td>
//                 <td>{project.project_name}</td>
//                 <td>{new Date(project.created_at).toLocaleDateString()}</td>
//                 <td>{project.status}</td>
//               </tr>
//             ))}
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
//                 <th>Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               {stages.map((stage, index) => (
//                 <tr key={stage.stage_id}>
//                   <td>{index + 1}</td>
//                   <td>{stage.stage_name}</td>
//                   <td>{stage.start_date || "N/A"}</td>
//                   <td>{stage.end_date || "N/A"}</td>
//                   <td>{stage.status}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </Table>
//         </Modal.Body>
//         <Modal.Footer>
//           <Form.Control type="email" placeholder="Enter recipient's email" value={email} onChange={(e) => setEmail(e.target.value)} />
//           <Button variant="primary" onClick={handleSendEmail}>Send PDF via Email</Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default ShareProject;














import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form } from "react-bootstrap";
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
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
      const res = await fetch("http://localhost:5000/projects/emails/all-emails");
      const data = await res.json();
      setEmails(data);
    } catch (err) {
      console.error("Error fetching emails:", err);
    }
  };

  const handleProjectClick = async (project) => {
    setSelectedProject(project);
    try {
      const res = await fetch(`http://localhost:5000/projects/${project.project_id}/stages`);
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
    // const pageWidth = doc.internal.pageSize.width;
    // let yPosition = 10; // Initial Y position
  
    // // Project Title (Wrap long titles)
    // doc.setFontSize(18);
    // const projectTitle = doc.splitTextToSize(selectedProject?.project_name || "Project Details", pageWidth - 20);
    // doc.text(projectTitle, 10, yPosition);
    // yPosition += projectTitle.length * 8; // Adjust Y based on text lines



    // Set font size for the title
doc.setFontSize(18);
const pageWidth = doc.internal.pageSize.width;
 let yPosition = 10; // Initial Y position

// Wrap long project titles
const projectTitle = doc.splitTextToSize(selectedProject?.project_name || "Project Details", pageWidth - 40);

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
    const projectDescription = doc.splitTextToSize(selectedProject?.description || "No description available.", pageWidth - 20);
    doc.text(projectDescription, 10, yPosition);
    yPosition += projectDescription.length * 6; // Adjust Y based on text lines
  
    // Table Header
    yPosition += 10; // Add space before table
  
    const tableColumn = ["#", "Stage Name", "Description", "Start Date", "End Date", "Status"];
    const tableRows = stages.map((stage, index) => [
      index + 1,
      doc.splitTextToSize(stage.stage_name, 40),
      doc.splitTextToSize(stage.description, 60),
      stage.start_date ? new Date(stage.start_date).toLocaleDateString() : "N/A",
      stage.end_date ? new Date(stage.end_date).toLocaleDateString() : "N/A",
      stage.status
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
        5: { cellWidth: 22 }
      },
      didDrawPage: function (data) {
        // Repeat Project Title on Every Page
        // doc.setFontSize(18);
        // doc.text(selectedProject?.project_name || "Project Details", 10, 10);
  
        // Add Page Number at the Bottom Right
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(10);
        doc.text(`Page ${pageCount}`, pageWidth - 20, doc.internal.pageSize.height - 10);
      }
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
    formData.append("pdf", pdfBlob, `project_${selectedProject.project_id}.pdf`);
  
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
      <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="mb-3">
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
            .filter((proj) => statusFilter === "All" || proj.status === statusFilter)
            .map((project, index) => (
              <tr key={project.project_id} onClick={() => handleProjectClick(project)} style={{ cursor: "pointer" }}>
                <td>{index + 1}</td>
                <td style={{ wordBreak: "break-word", whiteSpace: "normal", maxWidth: "200px" }}>{project.project_name}</td>
                <td>{project.created_at ? new Date(project.created_at).toLocaleDateString() : "N/A"}</td>
                <td>{project.updated_at ? new Date(project.updated_at).toLocaleDateString() : "N/A"}</td>
                <td>{project.status}</td>
              </tr>
            ))}
        </tbody>
      </Table>

      <Modal show={showDetailsModal} onHide={handleCloseModal}
      centered
      size="lg"
      style={{ display: "flex", justifyContent: "flex-start" }} >

        <Modal.Header closeButton>
          <Modal.Title style={{ 
      wordBreak: "break-word", 
      whiteSpace: "normal", 
      maxWidth: "100%" // Wraps based on modal width
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
                          <th>status</th>

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
                            <td>{stage.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
          {pdfUrl && <iframe src={pdfUrl} width="100%" height="400px" title="PDF Preview"></iframe>}
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
          <Button variant="secondary" onClick={generatePDF}>Generate PDF</Button>
          <Button variant="primary" onClick={handleSendEmail}>Send PDF via Email</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ShareProject;










// import React, { useState, useEffect } from "react";
// import { Table, Button, Modal, Form } from "react-bootstrap";
// import { PDFDocument, rgb } from "pdf-lib";
// import { saveAs } from "file-saver";

// const ShareProject = () => {
//   const [projects, setProjects] = useState([]);
//   const [selectedProject, setSelectedProject] = useState(null);
//   const [stages, setStages] = useState([]);
//   const [statusFilter, setStatusFilter] = useState("All");
//   const [showDetailsModal, setShowDetailsModal] = useState(false);
//   const [pdfUrl, setPdfUrl] = useState(null);
//   const [emails, setEmails] = useState(["", "", ""]); // Array to store three emails

//   useEffect(() => {
//     fetchProjects();
//   }, []);

//   // Fetch all projects
//   const fetchProjects = async () => {
//     try {
//       const res = await fetch("http://localhost:5000/projects/all-projects");
//       const data = await res.json();
//       setProjects(data);
//     } catch (err) {
//       console.error("Error fetching projects:", err);
//     }
//   };

//   // Fetch project details and stages
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
//     setPdfUrl(null); // Reset PDF when opening a new project
//   };

//   // Generate PDF in the frontend
//   const generatePDF = async () => {
//     if (!selectedProject) {
//       alert("No project selected!");
//       return;
//     }
  
//     try {
//       const pdfDoc = await PDFDocument.create();
//       let page = pdfDoc.addPage([600, 800]); // A4 Size
//       const { height } = page.getSize();
//       const fontSize = 12;
//       let yPos = height - 50;
  
//       // Project Title
//       page.drawText(`Project: ${selectedProject.project_name}`, { x: 50, y: yPos, size: 18, color: rgb(0, 0, 1) });
//       yPos -= 25;
  
//       // Project Description
//       page.drawText(`Description: ${selectedProject.description || "N/A"}`, { x: 50, y: yPos, size: fontSize });
//       yPos -= 20;
  
//       // Created Date
//       page.drawText(`Created Date: ${new Date(selectedProject.created_at).toLocaleDateString()}`, { x: 50, y: yPos, size: fontSize });
//       yPos -= 30;
  
//       // Table Headers
//       const columnPositions = { index: 50, name: 70, description: 250, startDate: 400, endDate: 480, status: 550 };
  
//       page.drawText("#", { x: columnPositions.index, y: yPos, size: fontSize, color: rgb(1, 0, 0) });
//       page.drawText("Stage Name", { x: columnPositions.name, y: yPos, size: fontSize, color: rgb(1, 0, 0) });
//       page.drawText("Description", { x: columnPositions.description, y: yPos, size: fontSize, color: rgb(1, 0, 0) });
//       page.drawText("Start Date", { x: columnPositions.startDate, y: yPos, size: fontSize, color: rgb(1, 0, 0) });
//       page.drawText("End Date", { x: columnPositions.endDate, y: yPos, size: fontSize, color: rgb(1, 0, 0) });
//       page.drawText("Status", { x: columnPositions.status, y: yPos, size: fontSize, color: rgb(1, 0, 0) });
  
//       yPos -= 20;
  
//       if (!stages || stages.length === 0) {
//         page.drawText("No stages available", { x: 50, y: yPos, size: fontSize });
//       } else {
//         // Sort Stages by Start Date & Add to PDF
//         stages
//           .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
//           .forEach((stage, index) => {
//             if (yPos < 50) { // Create a new page if needed
//               page = pdfDoc.addPage([600, 800]);
//               yPos = height - 50;
//             }
  
//             page.drawText(`${index + 1}`, { x: columnPositions.index, y: yPos, size: fontSize });
//             page.drawText(stage.stage_name || "N/A", { x: columnPositions.name, y: yPos, size: fontSize });
//             page.drawText(stage.description || "N/A", { x: columnPositions.description, y: yPos, size: fontSize });
//             page.drawText(stage.start_date ? new Date(stage.start_date).toLocaleDateString() : "N/A", { x: columnPositions.startDate, y: yPos, size: fontSize });
//             page.drawText(stage.end_date ? new Date(stage.end_date).toLocaleDateString() : "N/A", { x: columnPositions.endDate, y: yPos, size: fontSize });
//             page.drawText(stage.status || "N/A", { x: columnPositions.status, y: yPos, size: fontSize });
  
//             yPos -= 20;
//           });
//       }
  
//       const pdfBytes = await pdfDoc.save();
//       const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });
  
//       // ✅ Set PDF preview in the frontend
//       const pdfUrl = URL.createObjectURL(pdfBlob);
//       setPdfUrl(pdfUrl); // <-- Store URL in state
  
//       // Use FileSaver.js to download the PDF
//     //   saveAs(pdfBlob, `Project_${selectedProject.project_id}.pdf`);
//     } catch (error) {
//       console.error("Error generating PDF:", error);
//     }
//   };
  
  
  
  
  
  

//   // Handle email input change
//   const handleEmailChange = (index, value) => {
//     const newEmails = [...emails];
//     newEmails[index] = value;
//     setEmails(newEmails);
//   };

//   // Send PDF to backend for emailing
//   const handleSendEmail = async () => {
//     if (!emails[0] || !emails[1] || !emails[2]) {
//       alert("Please enter all three email addresses!");
//       return;
//     }

//     const pdfBlob = await generatePDF();
//     if (!pdfBlob) return;

//     const formData = new FormData();
//     formData.append("emails", JSON.stringify(emails)); // Send as JSON string
//     formData.append("pdf", pdfBlob, `project_${selectedProject.project_id}.pdf`);

//     try {
//       const res = await fetch("http://localhost:5000/projects/send-email", {
//         method: "POST",
//         body: formData,
//       });

//       const data = await res.json();
//       if (data.success) {
//         alert("Email sent successfully to all recipients!");
//       } else {
//         alert("Failed to send email.");
//       }
//     } catch (err) {
//       console.error("Error sending email:", err);
//     }
//   };

//   return (
//     <div className="container mt-4">
//       <h3 className="text-center mb-3">Project List</h3>

//       {/* Status Filter Dropdown */}
//       <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="mb-3">
//         <option value="All">All</option>
//         <option value="Pending">Pending</option>
//         <option value="Ongoing">Ongoing</option>
//         <option value="Completed">Completed</option>
//       </Form.Select>

//       {/* Projects Table */}
//       <Table bordered striped hover className="text-center">
//         <thead className="table-dark">
//           <tr>
//             <th>#</th>
//             <th>Project Name</th>
//             <th>Created Date</th>
//             <th>Status</th>
//           </tr>
//         </thead>
//         <tbody>
//           {projects
//             .filter((proj) => statusFilter === "All" || proj.status === statusFilter)
//             .map((project, index) => (
//               <tr key={project.project_id} onClick={() => handleProjectClick(project)} style={{ cursor: "pointer" }}>
//                 <td>{index + 1}</td>
//                 <td>{project.project_name}</td>
//                 <td>{new Date(project.created_at).toLocaleDateString()}</td>
//                 <td>{project.status}</td>
//               </tr>
//             ))}
//         </tbody>
//       </Table>

//       {/* Project Details Full-Screen Modal */}
// <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} fullscreen>
//   <Modal.Header closeButton>
//     <Modal.Title className="w-100 text-center">{selectedProject?.project_name}</Modal.Title>
//   </Modal.Header>
//   <Modal.Body>
//     <p><strong>Description:</strong> {selectedProject?.description}</p>

//     {/* Stages Table */}
//     <Table bordered striped className="w-100 text-center">
//       <thead className="table-dark">
//         <tr>
//           <th>#</th>
//           <th>Stage Name</th>
//           <th>Description</th>
//           <th>Start Date</th>
//           <th>End Date</th>
//           <th>Status</th>
//         </tr>
//       </thead>
//       <tbody>
//         {stages
//           .sort((a, b) => new Date(a.start_date) - new Date(b.start_date)) // Sorting by Start Date
//           .map((stage, index) => (
//             <tr key={stage.stage_id}>
//               <td>{index + 1}</td>
//               <td>{stage.stage_name}</td>
//               <td>{stage.description || "N/A"}</td>
//               <td>{stage.start_date ? new Date(stage.start_date).toLocaleDateString() : "N/A"}</td>
//               <td>{stage.end_date ? new Date(stage.end_date).toLocaleDateString() : "N/A"}</td>
//               <td>{stage.status}</td>
//             </tr>
//           ))}
//       </tbody>
//     </Table>

//     {/* PDF Preview */}
//     {pdfUrl && (
//       <iframe src={pdfUrl} width="100%" height="500px" title="PDF Preview"></iframe>
//     )}
//   </Modal.Body>
//   <Modal.Footer className="d-flex flex-column">
//     {emails.map((email, index) => (
//       <Form.Control
//         key={index}
//         type="email"
//         placeholder={`Enter recipient's email ${index + 1}`}
//         value={email}
//         onChange={(e) => handleEmailChange(index, e.target.value)}
//         className="mb-2 w-50"
//       />
//     ))}
//     <div className="d-flex gap-2">
//       <Button variant="secondary" onClick={generatePDF}>Generate PDF</Button>
//       <Button variant="primary" onClick={handleSendEmail}>Send PDF via Email</Button>
//     </div>
//   </Modal.Footer>
// </Modal>

//     </div>
//   );
// };

// export default ShareProject;
