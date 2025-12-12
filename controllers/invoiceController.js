const Invoice = require("../models/Invoice");

// GET ALL INVOICES
exports.getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.findAll({
      order: [['createdAt', 'DESC']]
    });

    if (!invoices || invoices.length === 0) {
      return res.status(404).json({ message: "No invoices found" });
    }

    res.json({
      success: true,
      count: invoices.length,
      data: invoices
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// SEARCH INVOICE BY REFERENCE OR EMAIL
exports.searchInvoice = async (req, res) => {
  try {
    const { reference, email } = req.query;

    if (!reference && !email) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide either reference or email for search" 
      });
    }

    let invoices;

    if (reference) {
      // Search by reference (exact match)
      invoices = await Invoice.findOne({ 
        where: { reference } 
      });
      
      if (invoices) {
        invoices = [invoices]; // Convert to array for consistent response
      }
    } else if (email) {
      // Search by email (can return multiple invoices)
      invoices = await Invoice.findAll({ 
        where: { email } 
      });
    }

    if (!invoices || invoices.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "No invoices found" 
      });
    }

    res.json({
      success: true,
      count: Array.isArray(invoices) ? invoices.length : 1,
      data: invoices
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// GET SINGLE INVOICE BY ID
exports.getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findByPk(id);

    if (!invoice) {
      return res.status(404).json({ 
        success: false, 
        message: "Invoice not found" 
      });
    }

    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};