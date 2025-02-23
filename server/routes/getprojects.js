const express = require("express");
const router = express.Router();
const pool = require("../db");
const multer = require("multer");
const nodemailer = require("nodemailer");
const upload = multer({ storage: multer.memoryStorage() });

// Create a new project
router.post("/project", async (req, res) => {
    try {
        const { project_name, description, status, created_at } = req.body;
        const newProject = await pool.query(
            "INSERT INTO projects (project_name, description, status, created_at) VALUES ($1, $2, $3, $4) RETURNING *",
            [project_name, description, status, created_at]
        );

        // ✅ Ensure response contains `success`
        res.json({ success: true, project: newProject.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, error: "Server error" });
    }
});


router.put("/complete/:id", async (req, res) => {
  try {
      const { id } = req.params;

      // Ensure the project exists
      const project = await pool.query("SELECT * FROM projects WHERE project_id = $1", [id]);
      if (project.rows.length === 0) {
          return res.status(404).json({ error: "Project not found" });
      }

      // Update the project status to "Completed"
      await pool.query(
          "UPDATE projects SET status = 'Completed', updated_at = NOW() WHERE project_id = $1",
          [id]
      );

      res.status(200).json({ message: "Project marked as Completed" });
  } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: "Server error" });
  }
});




// Get all projects with their associated stages
router.get("/all-projects", async (req, res) => {
  try {
      const result = await pool.query(`
         SELECT 
    p.project_id, 
    p.project_name, 
    p.description, 
    p.status, 
    p.created_at, 
    p.updated_at, 
    ps.stage_name AS last_stage,
    ps.start_date AS last_stage_start_date,
    ps.end_date AS last_stage_end_date,
    ps.status AS last_stage_status
FROM projects p
LEFT JOIN project_stages ps ON ps.id = (
    SELECT ps_inner.id 
    FROM project_stages ps_inner
    WHERE ps_inner.project_id = p.project_id
    ORDER BY ps_inner.id DESC 
    LIMIT 1
)
ORDER BY p.project_id ASC;  -- Order projects by project_id in ascending order

      `);
      res.json(result.rows);
  } catch (err) {
      console.error("Error fetching projects:", err);
      res.status(500).send("Server Error");
  }
});



// Get all stages
router.get("/all-stages", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM stages;");
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// Get all stages for a specific project
router.get("/:project_id/stages", async (req, res) => {
    try {
        const { project_id } = req.params;
        const result = await pool.query(`
            SELECT project_id, stage_id, stage_name, start_date, end_date, status, description
            FROM project_stages
            WHERE project_id = $1;
        `, [project_id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});


// ✅ Route to get total number of stages
router.get("/count", async (req, res) => {
    try {
        console.log("hjkldsadshjk;fj;afj");
      const result = await pool.query("SELECT COUNT(*) AS totalStages FROM stages");
      res.json(result.rows[0]); // Return total stage count
    } catch (err) {
      console.error("Error fetching stage count:", err);
      res.status(500).json({ error: "Server error" });
    }
  });
  

// Add stages to a project
// Add stages to a project
router.post("/add", async (req, res) => {
  try {
      const { project_id, stage_ids, custom_stage } = req.body;
      
      if (!stage_ids?.length && !custom_stage) {
          return res.status(400).json({ error: "No stages selected" });
      }

      // Get the last stage's end date (if exists)
      const lastStage = await pool.query(
          "SELECT end_date FROM project_stages WHERE project_id = $1 ORDER BY end_date DESC LIMIT 1",
          [project_id]
      );

      let start_date = lastStage.rows.length ? lastStage.rows[0].end_date : new Date();

      // let start_date = new Date(); // Default start date

      // Insert predefined stages
      if (stage_ids?.length) {
          for (const stage of stage_ids) {
              const { stage_id, start_date, status } = stage;

              const stageDetails = await pool.query("SELECT stage_name, description FROM stages WHERE stage_id = $1", [stage_id]);

              if (stageDetails.rows.length === 0) continue;

              const { stage_name, description } = stageDetails.rows[0];
              const end_date = stage.end_date === "" || stage.end_date === "N/A" ? null : stage.end_date;

              await pool.query(`
                  INSERT INTO project_stages (project_id, stage_id, stage_name, start_date, end_date, description, status)
                  VALUES ($1, $2, $3, $4, $5, $6, $7);
              `, [project_id, stage_id, stage_name, start_date, end_date, description, status]);
          }
      }

      // Insert custom stage if provided
      if (custom_stage) {
          const { stage_id, name, description,start_date, status } = custom_stage;
          const end_date = custom_stage.end_date === "" || custom_stage.end_date === "N/A" ? null : custom_stage.end_date;
          console.log(custom_stage);
          await pool.query(`
              INSERT INTO project_stages (project_id, stage_id, stage_name, start_date, end_date, description, status)
              VALUES ($1, $2, $3, $4, $5, $6, $7);
          `, [project_id, stage_id, name, start_date, end_date, description, status]);
      }

      // Update project status to "Ongoing" and set updated_at to start_date
      await pool.query(`
          UPDATE projects 
          SET status = 'Ongoing', updated_at = $1 
          WHERE project_id = $2;
      `, [start_date, project_id]);

      res.status(201).json({ message: "Stages added successfully and project updated" });
  } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
  }
});









// // Add stages to a project
// router.post("/add", async (req, res) => {
//   try {
//       const { project_id, stage_ids, custom_stage } = req.body;
      
//       if (!stage_ids?.length && !custom_stage) {
//           return res.status(400).json({ error: "No stages selected" });
//       }

//       // Get the last stage's end date (if exists)
//       const lastStage = await pool.query(
//           "SELECT end_date FROM project_stages WHERE project_id = $1 ORDER BY end_date DESC LIMIT 1",
//           [project_id]
//       );

//       let start_date = lastStage.rows.length ? lastStage.rows[0].end_date : new Date();

//       // Insert predefined stages
//       if (stage_ids?.length) {
//           for (const stage of stage_ids) {
//               const { stage_id, start_date, end_date, status } = stage;

//               console.log(start_date);
//               const stageDetails = await pool.query("SELECT stage_name, description FROM stages WHERE stage_id = $1", [stage_id]);

//               if (stageDetails.rows.length === 0) continue;

//               const { stage_name, description } = stageDetails.rows[0];

//               await pool.query(`
//                   INSERT INTO project_stages (project_id, stage_id, stage_name, start_date, end_date, description, status)
//                   VALUES ($1, $2, $3, $4, $5, $6, $7);
//               `, [project_id, stage_id, stage_name, start_date, end_date, description, status]);

//               // start_date = end_date; // Next stage start date = this stage's end date
//           }
//       }

//       // Insert custom stage if provided
//       if (custom_stage) {
//           // console.log(custom_stage);
//           const { stage_id, name, description, end_date, status } = custom_stage;
//           await pool.query(`
//               INSERT INTO project_stages (project_id, stage_id, stage_name, start_date, end_date, description, status)
//               VALUES ($1, $2, $3, $4, $5, $6, $7);
//           `, [project_id, stage_id, name, start_date, end_date, description, status]);
//       }

//       res.status(201).json({ message: "Stages added successfully" });
//   } catch (err) {
//       console.error(err.message);
//       res.status(500).send("Server Error");
//   }
// });






// Update project stage
router.put("/update-stage", async (req, res) => {
    try {
      const { project_id, stage_id, status, start_date, end_date } = req.body;
      console.log(req.body);
  
      // Validate input
      if (!project_id || !stage_id || !status) {
        return res.status(400).json({ error: "Missing required fields" });
      }
  
      // Update query
      const result = await pool.query(
        `UPDATE project_stages 
         SET status = $1, start_date = $2, end_date = $3 
         WHERE project_id = $4 AND stage_id = $5 
         RETURNING *`,
        [status, start_date || null, end_date || null, project_id, stage_id]
      );
  
      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Stage not found" });
      }
  
      res.json({ message: "Stage updated successfully", stage: result.rows[0] });
    } catch (error) {
      console.error("Error updating stage:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });







// Route to update project details and stages
router.put("/update/:project_id", async (req, res) => {
    try {
      const { project_id } = req.params;
      const { project_name, description, created_at, stages } = req.body;
      console.log(req.body);
  
      // Update the project details
      const updateProjectQuery = `
        UPDATE projects 
        SET project_name = $1, description = $2, created_at = $3, updated_at = NOW()
        WHERE project_id = $4;
      `;
      await pool.query(updateProjectQuery, [project_name, description, created_at, project_id]);
  
      // Update the stages
      for (let stage of stages) {
        const updateStageQuery = `
          UPDATE project_stages
          SET stage_name =$1, start_date = $2, end_date = $3, status = $4, description = $5
          WHERE project_id = $6 AND stage_id = $7;
        `;
        await pool.query(updateStageQuery, [stage.stage_name, stage.start_date, stage.end_date || null, stage.status, stage.description, stage.project_id, stage.stage_id]);
  
        
      }
  
      res.json({ message: "Project updated successfully" });
    } catch (err) {
      console.error("Error updating project:", err);
      res.status(500).json({ error: "Server error updating project" });
    }
  });






  

  router.post("/send-email", upload.single("pdf"), async (req, res) => {
      try {
          const emails = JSON.parse(req.body.emails);
          const pdf = req.file;
  
          const transporter = nodemailer.createTransport({
              service: "gmail",
              auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
          });
  
          const mailOptions = {
              from: process.env.EMAIL_USER,
              to: emails.join(","), // Send to multiple recipients
              subject: "Project Report",
              text: "Attached is your project report.",
              attachments: [{ filename: "Project_Report.pdf", content: pdf.buffer }],
          };
  
          await transporter.sendMail(mailOptions);
          res.json({ success: true });
      } catch (err) {
          console.error("Email sending error:", err);
          res.status(500).json({ success: false, message: "Failed to send email." });
      }
  });












// Get all emails
router.get("/emails/all-emails", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM emails ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching emails:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Add a new email
router.post("/emails/add-email", async (req, res) => {
  const { name, email } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO emails (name, email) VALUES ($1, $2) RETURNING *",
      [name, email]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error adding email:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update an existing email
router.put("/emails/update-email/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  try {
    const result = await pool.query(
      "UPDATE emails SET name = $1, email = $2 WHERE id = $3 RETURNING *",
      [name, email, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating email:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete an email
router.delete("/emails/delete-email/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM emails WHERE id = $1", [id]);
    res.json({ message: "Email deleted successfully" });
  } catch (err) {
    console.error("Error deleting email:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});








// // Get all stages
// router.get("/stages", async (req, res) => {
//     try {
//         const stages = await pool.query("SELECT * FROM stages");
//         res.json(stages.rows);
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send("Server error");
//     }
// });

// // Insert project stages
// router.post("/project-stages", async (req, res) => {
//     try {
//         const { project_id, selectedStages, newStages } = req.body;

//         for (const stageId of selectedStages) {
//             await pool.query(
//                 "INSERT INTO project_stages (project_id, stage_id, status) VALUES ($1, $2, 'Pending')",
//                 [project_id, stageId]
//             );
//         }

//         for (const stageName of newStages) {
//             const newStage = await pool.query(
//                 "INSERT INTO stages (stage_name) VALUES ($1) RETURNING *",
//                 [stageName]
//             );
//             await pool.query(
//                 "INSERT INTO project_stages (project_id, stage_id, status) VALUES ($1, $2, 'Pending')",
//                 [project_id, newStage.rows[0].stage_id]
//             );
//         }

//         res.status(201).send("Project and stages added successfully");
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send("Server error");
//     }
// });

module.exports = router;
