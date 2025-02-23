const router = require("express").Router();
const bcrypt = require("bcrypt");
const pool = require("../db");

const jwtGenerator = require("../utils/jwtGenerator");
const authAdmin = require("../middlewares/authAdmin");
require("dotenv").config();


// --- Register a new admin ---
router.post("/admin-register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (![name, email, password].every(Boolean)) {
      return res.status(400).json({
        message: "Please enter all the required fields.",
      });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // --- Set the currently active admin(s) to inactive ---
      await client.query("UPDATE admin SET status = 'inactive' WHERE status = 'active'");

      // --- Check if the admin email already exists ---
      const existingAdmin = await client.query(
        "SELECT * FROM admin WHERE email = $1",
        [email]
      );

      let newAdmin;

      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      if (existingAdmin.rows.length > 0) {
        const adminData = existingAdmin.rows[0];

        if (adminData.status === "inactive") {
          // If admin is inactive, reactivate and update the password
          const updateResult = await client.query(
            "UPDATE admin SET name = $1, password = $2, status = 'active' WHERE email = $3 RETURNING *",
            [name, hashedPassword, email]
          );
          newAdmin = updateResult.rows[0];
        } else {
          // This should not happen because we already set all active admins to inactive above
          await client.query("ROLLBACK");
          return res.status(400).json({
            message: "Unexpected error: An admin is still active.",
          });
        }
      } else {
        // Insert the new admin as active
        const result = await client.query(
          "INSERT INTO admin (name, email, password, status) VALUES ($1, $2, $3, 'active') RETURNING *",
          [name, email, hashedPassword]
        );
        newAdmin = result.rows[0];
      }

      await client.query("COMMIT");

      // Generate a token
      const token = jwtGenerator(newAdmin.password);

      return res.status(201).json({
        message: "Registration successful",
        token,
        admin: {
          id: newAdmin.id,
          name: newAdmin.name,
          email: newAdmin.email,
          status: newAdmin.status,
        },
      });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error in admin registration:", error);
      return res.status(500).json({
        message: "Database error while processing admin registration.",
        error: error.message,
      });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Unexpected error in admin registration:", err);
    return res.status(500).json({
      message: "Something went wrong. Please try again.",
      error: err.message,
    });
  }
});



// // --- Register a new admin ---
// router.post("/admin-register", async (req, res) => {
//   // --- 1. Destructure the req.body
//   const { name, email, password } = req.body;

//   try {
//     // --- 2. Check if all the required fields are present
//     if (![email, password].every(Boolean)) {
//       return res.status(401).json({
//         message: "Please enter all the required fields. From adminAuth",
//       });
//     }

//     // --- 3. Check if the admin email already exists
//     const admin = await pool.query("SELECT email FROM admin WHERE email = $1", [
//       email,
//     ]);
//     if (admin.rows.length > 0) {
//       return res.status(401).json({
//         message: "Email is already registered. From adminAuth",
//       });
//     }

//     // --- 4. Hash the password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     // --- 5. Insert the admin into the database
//     const client = await pool.connect();
//     let newAdmin; // Declare outside try block to use it later
//     try {
//       await client.query("BEGIN");

//       // Set previous admins to inactive
//       await client.query(`
//           UPDATE admin SET status = 'inactive' WHERE status = 'active'
//       `);

//       // Insert new admin as active
//       const result = await client.query(
//         `INSERT INTO admin (name, email, password, status) 
//          VALUES ($1, $2, $3, 'active') RETURNING *`,
//         [name, email, hashedPassword]
//       );

//       if (result.rows.length > 0) {
//         newAdmin = result.rows[0]; // Assign newAdmin properly
//         console.log("New admin added:", newAdmin);
//       } else {
//         console.log("No admin was added.");
//         return res.status(500).json({ message: "Admin could not be added." });
//       }

//       await client.query("COMMIT");
//     } catch (error) {
//       await client.query("ROLLBACK");
//       console.error("Error inserting admin:", error);
//       return res.status(500).json({
//         message: "Database error while inserting admin.",
//         error: error.message,
//       });
//     } finally {
//       client.release();
//     }

//     // --- 6. Generate a token
//     if (!newAdmin) {
//       return res.status(500).json({ message: "New admin data is missing." });
//     }

//     const token = jwtGenerator(newAdmin.password);
//     return res.status(201).json({
//       message: "Register Successful",
//       token: token,
//       admin: {
//         id: newAdmin.id,
//         name: newAdmin.name,
//         email: newAdmin.email,
//         status: newAdmin.status,
//       },
//     });
//   } catch (err) {
//     console.error("Error in admin registration:", err);
//     return res.status(500).json({
//       message: "Something went wrong. Please try again. From adminAuth",
//       error: err.message,
//     });
//   }
// });

// --- Login a Admin ---

router.post("/admin-login", async (req, res) => {
  // --- 1. Destructure the req.body
  const { email, password } = req.body;

  // --- 2. Check if all the required fields are present
  if (![email, password].every(Boolean)) {
    return res.status(401).json({
      message: "Please enter all the required fields. From adminAuth",
    });
  }

  try {
    // --- 3. Chech if admin email exists
    const admin = await pool.query("SELECT * FROM admin WHERE email = $1 AND status = 'active'", [
      email,
    ]);
    if (admin.rows.length === 0) {
      return res.status(401).json({
        message: "Admin is not registered. From adminAuth",
      });
    }

    // --- 4. Check if the password is correct
    const isPasswordCorrect = await bcrypt.compare(
      password,
      admin.rows[0].password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Incorrect Credential. From adminAuth",
      });
    }

    // --- 5. Generate a token
    const token = jwtGenerator(admin.rows[0].password);

    return res.json({ token }); // Set the token in the header
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error. Please try again. From adminAuth");
  }
});

// --- Check ShopAuthentication
router.get("/check-auth", authAdmin, (req, res) => {
  console.log("You are logged in. From adminAuth");
  try {
    res.send("You are logged in. From adminAuth");
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server Error. Please try again. From adminAuth");
  }
});

// --------- Get admin gmail id
router.get("/admin-dashboard", authAdmin, async (req, res) => {
  try {
    const response = await pool.query("SELECT name FROM admin");
    const name = response.rows[0].name; // Access email from the response
    console.log("Name: ", name);
    return res.json({ name }); // Send email as an object
  } catch (err) {
    console.log("Error: ", err.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
