const express = require("express");
const router = express.Router();
const pool = require("../db");

// Get all stages
router.get("/all-stages", async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM stages ORDER BY stage_id");
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  });
  
  // Add a new stage
  router.post("/add-stage", async (req, res) => {
    try {
      const { stage_name, description } = req.body;
      const result = await pool.query(
        "INSERT INTO stages (stage_name, description) VALUES ($1, $2) RETURNING *",
        [stage_name, description]
      );
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  });
  
  // Update an existing stage
  router.put("/update-stage/:id", async (req, res) => {
    try {
      const { stage_name, description } = req.body;
      const { id } = req.params;
      const result = await pool.query(
        "UPDATE stages SET stage_name = $1, description = $2 WHERE stage_id = $3 RETURNING *",
        [stage_name, description, id]
      );
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  });


  // Delete a stage
router.delete("/delete-stage/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM stages WHERE stage_id = $1", [id]);
        res.send("Stage deleted successfully");
    } catch (err) {
        console.error(err.message);
    }
});

module.exports = router;
