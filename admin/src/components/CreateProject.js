// CreateProject.js

import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import "../style/CreateProject.css"; // Import CSS file for styling

const CreateProject = () => {
  const [project, setProject] = useState({
    project_name: "",
    description: "",
    // status: "Pending",
    created_at: "",
  });

  const history = useHistory();

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("From Front-end: ", project);

    fetch("http://localhost:5000/projects/project", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...project, status: "Pending" }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Response from backend:", data); // ✅ Debugging
    
        if (data.success) {
          history.push("/admin-dashboard"); // ✅ Redirect only if success is true
        } else {
          alert("Error: " + (data.error || "Invalid response from server"));
        }
      })
      .catch((error) => {
        console.error("Fetch Error:", error);
        alert("An error occurred. Check console for details.");
      });
    
  };

  return (
    <div className="create-project-container">
      <div className="create-project-form">
        <h3 className="create-project-heading">Create New Project</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="inputProjectName" className="form-label">
              Project Name
            </label>
            <input
              type="text"
              className="form-control"
              id="inputProjectName"
              placeholder="Enter Project Name"
              value={project.project_name}
              onChange={(e) =>
                setProject({ ...project, project_name: e.target.value })
              }
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="inputDescription" className="form-label">
              Description
            </label>
            <textarea
              className="form-control"
              id="inputDescription"
              placeholder="Enter Project Description"
              value={project.description}
              onChange={(e) =>
                setProject({ ...project, description: e.target.value })
              }
            />
          </div>
          <div className="mb-3">
            <label htmlFor="inputCreatedAt" className="form-label">
              Created At
            </label>
            <input
              type="date"
              className="form-control"
              id="inputCreatedAt"
              value={project.created_at}
              onChange={(e) =>
                setProject({ ...project, created_at: e.target.value })
              }
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Create Project
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;






// import React, { useState, useEffect } from "react";

// const CreateProject = () => {
//   const [projectName, setProjectName] = useState("");
//   const [description, setDescription] = useState("");
//   const [createdAt, setCreatedAt] = useState("");
//   const [stages, setStages] = useState([]);
//   const [selectedStages, setSelectedStages] = useState([]);
//   const [newStages, setNewStages] = useState([]);

//   useEffect(() => {
//     fetch("http://localhost:5000/projects/stages")
//       .then((res) => res.json())
//       .then((data) => setStages(data))
//       .catch((err) => console.error("Error fetching stages:", err));
//   }, []);

//   const handleStageSelect = (stageId) => {
//     setSelectedStages((prev) =>
//       prev.includes(stageId) ? prev.filter((id) => id !== stageId) : [...prev, stageId]
//     );
//   };

//   const addNewStage = (e) => {
//     if (e.key === "Enter" && e.target.value.trim()) {
//       setNewStages([...newStages, e.target.value.trim()]);
//       e.target.value = "";
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const projectResponse = await fetch("http://localhost:5000/projects/project", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ project_name: projectName, description, status: "Pending", created_at: createdAt }),
//       });

//       if (!projectResponse.ok) throw new Error("Failed to create project");
//       const projectData = await projectResponse.json();
//       const project_id = projectData.project_id;

//       await fetch("http://localhost:5000/projects/project-stages", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ project_id, selectedStages, newStages }),
//       });

//       alert("Project created successfully!");
//       setProjectName("");
//       setDescription("");
//       setCreatedAt("");
//       setSelectedStages([]);
//       setNewStages([]);
//     } catch (error) {
//       console.error("Error submitting project:", error);
//     }
//   };

//   return (
//     <div className="container mt-5">
//       <h2>Create New Project</h2>
//       <form onSubmit={handleSubmit}>
//         <input type="text" placeholder="Project Name" value={projectName} onChange={(e) => setProjectName(e.target.value)} required />
//         <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
//         <input type="datetime-local" value={createdAt} onChange={(e) => setCreatedAt(e.target.value)} required />
        
//         <h4>Select Stages</h4>
//         {stages.map((stage) => (
//           <div key={stage.stage_id}>
//             <input type="checkbox" checked={selectedStages.includes(stage.stage_id)} onChange={() => handleStageSelect(stage.stage_id)} />
//             {stage.stage_name}
//           </div>
//         ))}
        
//         <h4>Add New Stages</h4>
//         <input type="text" placeholder="New Stage Name" onKeyDown={addNewStage} />
//         <ul>{newStages.map((stage, idx) => <li key={idx}>{stage}</li>)}</ul>
        
//         <button type="submit">Create Project</button>
//       </form>
//     </div>
//   );
// };

// export default CreateProject;











// import React, { useState, useEffect } from "react";

// const CreateProject = () => {
//   const [projectName, setProjectName] = useState("");
//   const [description, setDescription] = useState("");
//   const [stages, setStages] = useState([]);
//   const [selectedStages, setSelectedStages] = useState([]);
//   const [dates, setDates] = useState({});
//   const [newStage, setNewStage] = useState("");
//   const [customStages, setCustomStages] = useState([]);

//   useEffect(() => {
//     // Fetch all available stages from backend
//     fetch("http://localhost:5000/projects/stages")
//       .then((res) => res.json())
//       .then((data) => setStages(data))
//       .catch((err) => console.error("Error fetching stages:", err));
//   }, []);

//   const handleStageChange = (stageId) => {
//     setSelectedStages((prev) =>
//       prev.includes(stageId) ? prev.filter((id) => id !== stageId) : [...prev, stageId]
//     );
//   };

//   const handleDateChange = (stageId, type, value) => {
//     setDates((prev) => ({
//       ...prev,
//       [stageId]: { ...prev[stageId], [type]: value },
//     }));
//   };

//   const handleAddStage = () => {
//     if (newStage.trim()) {
//       const newStageObj = { stage_id: `custom-${customStages.length + 1}`, stage_name: newStage };
//       setCustomStages([...customStages, newStageObj]);
//       setNewStage("");
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       // Step 1: Create the project and get the project_id
//       const projectRes = await fetch("http://localhost:5000/projects/project", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ project_name: projectName, description }),
//       });

//       const projectData = await projectRes.json();
//       const projectId = projectData.project_id;

//       // Step 2: Insert selected stages into project_stages table
//       await fetch("http://localhost:5000/projects/project-stages", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           project_id: projectId,
//           stages: [...selectedStages, ...customStages.map((stage) => stage.stage_id)].map((stageId) => ({
//             stage_id: stageId,
//             start_date: dates[stageId]?.start_date || null,
//             end_date: dates[stageId]?.end_date || null,
//           })),
//         }),
//       });

//       alert("Project and stages added successfully!");
//     } catch (error) {
//       console.error("Error adding project:", error);
//     }
//   };

//   return (
//     <div>
//       <h2>Create Project</h2>
//       <form onSubmit={handleSubmit}>
//         <input
//           type="text"
//           placeholder="Project Name"
//           value={projectName}
//           onChange={(e) => setProjectName(e.target.value)}
//           required
//         />
//         <textarea
//           placeholder="Description"
//           value={description}
//           onChange={(e) => setDescription(e.target.value)}
//         />

//         <h3>Select Stages</h3>
//         {stages.map((stage) => (
//           <div key={stage.stage_id}>
//             <input
//               type="checkbox"
//               value={stage.stage_id}
//               onChange={() => handleStageChange(stage.stage_id)}
//             />
//             {stage.stage_name}
//             {selectedStages.includes(stage.stage_id) && (
//               <>
//                 <input
//                   type="date"
//                   onChange={(e) => handleDateChange(stage.stage_id, "start_date", e.target.value)}
//                 />
//                 <input
//                   type="date"
//                   onChange={(e) => handleDateChange(stage.stage_id, "end_date", e.target.value)}
//                 />
//               </>
//             )}
//           </div>
//         ))}

//         <h3>Add Custom Stages</h3>
//         <input
//           type="text"
//           placeholder="New Stage Name"
//           value={newStage}
//           onChange={(e) => setNewStage(e.target.value)}
//         />
//         <button type="button" onClick={handleAddStage}>Add Stage</button>

//         {customStages.map((stage) => (
//           <div key={stage.stage_id}>
//             <input type="checkbox" checked disabled />
//             {stage.stage_name}
//             <input
//               type="date"
//               onChange={(e) => handleDateChange(stage.stage_id, "start_date", e.target.value)}
//             />
//             <input
//               type="date"
//               onChange={(e) => handleDateChange(stage.stage_id, "end_date", e.target.value)}
//             />
//           </div>
//         ))}

//         <button type="submit">Create Project</button>
//       </form>
//     </div>
//   );
// };

//  export default CreateProject;











// import React, { useState, useEffect } from "react";
// import axios from "axios";

// const CreateProject = () => {
//   const [projectName, setProjectName] = useState("");
//   const [description, setDescription] = useState("");
//   const [stages, setStages] = useState([]);
//   const [selectedStages, setSelectedStages] = useState([]);
//   const [dates, setDates] = useState({});

//   useEffect(() => {
//     // Fetch all available stages from backend
//     axios.get("http://localhost:5000/stages").then((res) => {
//       setStages(res.data);
//     });
//   }, []);

//   const handleStageChange = (stageId) => {
//     setSelectedStages((prev) =>
//       prev.includes(stageId) ? prev.filter((id) => id !== stageId) : [...prev, stageId]
//     );
//   };

//   const handleDateChange = (stageId, type, value) => {
//     setDates((prev) => ({
//       ...prev,
//       [stageId]: { ...prev[stageId], [type]: value },
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       // Step 1: Create the project and get the project_id
//       const projectRes = await axios.post("http://localhost:5000/projects", {
//         project_name: projectName,
//         description,
//       });
//       const projectId = projectRes.data.project_id;

//       // Step 2: Insert selected stages into project_stages table
//       await axios.post("http://localhost:5000/project-stages", {
//         project_id: projectId,
//         stages: selectedStages.map((stageId) => ({
//           stage_id: stageId,
//           start_date: dates[stageId]?.start_date || null,
//           end_date: dates[stageId]?.end_date || null,
//         })),
//       });

//       alert("Project and stages added successfully!");
//     } catch (error) {
//       console.error("Error adding project:", error);
//     }
//   };

//   return (
//     <div>
//       <h2>Create Project</h2>
//       <form onSubmit={handleSubmit}>
//         <input
//           type="text"
//           placeholder="Project Name"
//           value={projectName}
//           onChange={(e) => setProjectName(e.target.value)}
//           required
//         />
//         <textarea
//           placeholder="Description"
//           value={description}
//           onChange={(e) => setDescription(e.target.value)}
//         />

//         <h3>Select Stages</h3>
//         {stages.map((stage) => (
//           <div key={stage.stage_id}>
//             <input
//               type="checkbox"
//               value={stage.stage_id}
//               onChange={() => handleStageChange(stage.stage_id)}
//             />
//             {stage.stage_name}
//             {selectedStages.includes(stage.stage_id) && (
//               <>
//                 <input
//                   type="date"
//                   onChange={(e) => handleDateChange(stage.stage_id, "start_date", e.target.value)}
//                 />
//                 <input
//                   type="date"
//                   onChange={(e) => handleDateChange(stage.stage_id, "end_date", e.target.value)}
//                 />
//               </>
//             )}
//           </div>
//         ))}
//         <button type="submit">Create Project</button>
//       </form>
//     </div>
//   );
// };

// export default CreateProject;









// import React, { useState } from "react";

// const CreateProject = () => {
//   const [projectName, setProjectName] = useState("");
//   const [description, setDescription] = useState("");
//   const [createdAt, setCreatedAt] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const projectResponse = await fetch("http://localhost:5000/projects/project", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ project_name: projectName, description, status: "Pending", created_at: createdAt }),
//       });

//       if (!projectResponse.ok) throw new Error("Failed to create project");

//       alert("Project created successfully!");
//       setProjectName("");
//       setDescription("");
//       setCreatedAt("");
//     } catch (error) {
//       console.error("Error submitting project:", error);
//     }
//   };

//   return (
//     <div className="flex justify-center items-center min-h-screen bg-gray-100">
//       <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
//         <h2 className="text-2xl font-bold text-center mb-6">Create New Project</h2>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           {/* Project Name */}
//           <div>
//             <label className="block text-gray-700 font-medium">Project Name</label>
//             <input
//               type="text"
//               placeholder="Enter project name"
//               value={projectName}
//               onChange={(e) => setProjectName(e.target.value)}
//               required
//               className="w-full p-2 border rounded mt-1"
//             />
//           </div>

//           {/* Description */}
//           <div>
//             <label className="block text-gray-700 font-medium">Description</label>
//             <textarea
//               placeholder="Enter project description"
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               className="w-full p-2 border rounded mt-1 h-24"
//             ></textarea>
//           </div>

//           {/* Created At */}
//           <div>
//             <label className="block text-gray-700 font-medium">Start Date</label>
//             <input
//               type="datetime-local"
//               value={createdAt}
//               onChange={(e) => setCreatedAt(e.target.value)}
//               required
//               className="w-full p-2 border rounded mt-1"
//             />
//           </div>

//           {/* Submit Button */}
//           <button
//             type="submit"
//             className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition"
//           >
//             Create Project
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default CreateProject;
