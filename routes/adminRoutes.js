const express = require("express");
const router = express.Router();
const admin = require("../models/admin.js");
require("dotenv").config();

const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

// Dummy generateToken function (replace with your actual JWT generation)
const { generateToken } = require("../jwt"); // Make sure this exists

// -------------------- LOGIN --------------------
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin_ = await admin.findOne({ username });

    if (!admin_) {
      return res.status(401).json({ error: "Invalid username" });
    }

    if (admin_.password !== password) {
      return res.status(401).json({ error: "Incorrect Password" });
    }

    const payload = { id: admin_._id };
    const token = generateToken(payload);

    res.status(200).json({ response: admin_, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// -------------------- ENSURE UPLOADS FOLDER --------------------
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// -------------------- MULTER STORAGE --------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`),
});
const upload = multer({ storage });

// -------------------- UPLOAD DOCUMENT --------------------
router.post("/upload-doc", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const adminUsername = process.env.ADMIN_USERNAME;
    const admin_ = await admin.findOne({ username: adminUsername });
    if (!admin_) {
      return res.status(404).json({ error: "Admin not found" });
    }

    // Save metadata in MongoDB
    admin_.documents.push({
      name: file.originalname,
      path: file.path,
      contentType: file.mimetype,
    });
    await admin_.save();

    // Use relative path to your Python script for deployment
    const pythonScript = path.join(__dirname, "..", "scripts", "chatbot_doc_5.py");

    const pyProcess = spawn("python", [pythonScript, file.path]);

    pyProcess.stdout.on("data", (data) => {
      console.log(`📢 Python: ${data.toString()}`);
    });

    pyProcess.stderr.on("data", (data) => {
      console.error(`⚠️ Python error: ${data.toString()}`);
    });

    pyProcess.on("close", (code) => {
      if (code === 0) {
        return res.status(200).json({
          message: "Document uploaded & indexed successfully",
        });
      } else {
        return res.status(500).json({
          error: "Document saved, but indexing failed.",
        });
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// -------------------- DELETE DOCUMENT --------------------
router.delete("/delete-doc/:docName", async (req, res) => {
  try {
    const { docName } = req.params;
    const adminUsername = process.env.ADMIN_USERNAME;

    const admin_ = await admin.findOne({ username: adminUsername });
    if (!admin_) {
      return res.status(404).json({ error: "Admin not found" });
    }

    // Find the document
    const document = admin_.documents.find((doc) => doc.name === docName);
    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    // Remove from DB
    admin_.documents = admin_.documents.filter((doc) => doc.name !== docName);
    await admin_.save();

    // Remove file from disk
    if (document.path && fs.existsSync(document.path)) {
      fs.unlinkSync(document.path);
      console.log(`🗑️ Deleted file from disk: ${document.path}`);
    }

    res.status(200).json({ message: "Document deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// -------------------- SERVE DOCUMENT --------------------
router.get("/document/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    const adminUsername = process.env.ADMIN_USERNAME;

    const admin_ = await admin.findOne({ username: adminUsername });
    if (!admin_) {
      return res.status(404).json({ error: "Admin not found" });
    }

    const document = admin_.documents.find(
      (doc) => doc.name === decodeURIComponent(filename)
    );
    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    res.set({
      "Content-Type": document.contentType,
      "Content-Disposition": `inline; filename="${document.name}"`,
    });

    const filePath = path.isAbsolute(document.path)
      ? document.path
      : path.join(__dirname, "..", document.path);

    return res.sendFile(filePath);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// -------------------- GET ALL DOCUMENTS --------------------
router.get("/get-docs", async (req, res) => {
  try {
    const adminUsername = process.env.ADMIN_USERNAME;
    const admin_ = await admin.findOne({ username: adminUsername });

    if (!admin_) {
      return res.status(404).json({ error: "Admin not found" });
    }

    const documents = admin_.documents.map((doc) => ({
      name: doc.name,
      url: `${req.protocol}://${req.get("host")}/admin/document/${encodeURIComponent(
        doc.name
      )}`,
    }));

    res.status(200).json({ documents });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
