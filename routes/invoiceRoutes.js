const express = require("express");
const {
  getAllInvoices,
  searchInvoice,
  getInvoiceById
} = require("../controllers/invoiceController");

const router = express.Router();

// Get all invoices
router.get("/", getAllInvoices);

// Search invoice by reference or email
// Example: /invoices/search?reference=REF123
// Example: /invoices/search?email=customer@example.com
router.get("/search", searchInvoice);

// Get single invoice by ID
router.get("/:id", getInvoiceById);

module.exports = router;