# Work Stage Management and Tracking System

🎯 **Academic Project**  
Department of Computer Science & Engineering  
University of Chittagong  

---

## 📌 Overview

In many organizations, managing a project’s progress across multiple departments and approvals is often complex and inefficient.  
**Work Stage Management and Tracking System** is a web-based tool that enables seamless tracking of both **predefined** and **custom-added** project stages to ensure **transparency, accountability, and operational efficiency**.

The system is designed based on real-world requirements gathered through stakeholder meetings and discussions.

---

## 🎯 Project Objectives

- Track project progress accurately across predefined and custom stages.
- Visualize project flow using **tables** and **flow diagrams**.
- Provide flexibility to add and configure custom stages.
- Generate and send detailed reports via **PDF** and **email**.
- Improve communication, monitoring, and documentation.

---


## 🖥️ Key Features

### 👨‍💼 Admin Panel
- Create, update, and delete projects.
- Assign predefined stage flows.
- Add and manage custom stages.
- Input/edit dates and statuses.
- Generate PDF report and send via email.

### 👨‍💻 Client Panel
- View assigned project details
- Track project progress by stages
- No editing permission for clients

### 📊 Stage Visualization
- Tabular view of all project stages with their metadata.
- Graphical view (Mermaid.js / react-flow) to show progress visually.
- Auto update of `updated_at` timestamp when changes occur.

### 📤 PDF & Email
- Automatically generate PDF summary of any project.
- Send PDF report to a recipient using email.

---

## 🧭 Functional Scope

- [x] Create, view, update, delete projects  
- [x] Assign predefined stage flow  
- [x] Add/edit custom stages  
- [x] Set start and end date, status  
- [x] View stage list (table)  
- [x] View stage diagram (graph)  
- [x] Generate PDF report  
- [x] Email PDF to recipient  
- [x] Admin login and secure access  

---

## 🛠️ Tech Stack

| Layer              | Technology               |
|-------------------|---------------------------|
| Frontend           | React.js                  |
| Backend            | Node.js (Express.js)      |
| Database           | PostgreSQL                |
| PDF Generation     | pdfmake / jsPDF           |
| Graph Visualization| Mermaid.js / react-flow   |
| Email Sending      | Nodemailer                |
| Styling/UI         | Tailwind CSS, React Modal, Date Picker |

---

## 🔄 Project Workflow

```
[ Start ]
   ↓
Create Project → Assign Predefined Stages
   ↓
Add Custom Stages (if needed)
   ↓
Input Start Date, End Date, Status for each Stage
   ↓
View Project Stages (Table & Graph)
   ↓
Generate PDF Report
   ↓
Send PDF via Email
   ↓
[ End ]
```

---


## 📤 Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/work-stage-tracking.git
   cd work-stage-tracking
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Backend setup:
   - Set up PostgreSQL database
   - Configure `.env` file with database and email credentials

---

## ✅ Expected Outcome

- 🔹 A working web app to manage complex, stage-based project flows  
- 🔹 Both tabular and graphical representation of project progress  
- 🔹 Reporting via downloadable PDF  
- 🔹 Communication via email integration  
- 🔹 Transparent and efficient project tracking  

---
