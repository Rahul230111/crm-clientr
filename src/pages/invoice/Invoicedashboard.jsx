import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Row,
  Col,
  Statistic,
  Tag,
  Drawer,
  message,
  Spin,
  Button,
  Space,
} from "antd";
import {
  RiseOutlined,
  FallOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "antd/dist/reset.css"; // Ensure Ant Design styles are loaded
import InvoiceForm from './InvoiceForm'; // Component for adding/editing invoices
import InvoiceList from "./InvoiceList"; // Component for displaying the list of invoices
import NotesDrawer from './NotesDrawer'; // Component for viewing/adding notes

// Import your configured axios instance for API calls
import axios from "../../api/axios";

const InvoiceDashboard = () => {
  // State to hold all fetched invoices
  const [invoices, setInvoices] = useState([]);
  // State to manage loading indicator
  const [loading, setLoading] = useState(true);
  // State to store any error messages
  const [error, setError] = useState(null);
  // State to control visibility of the InvoiceForm drawer
  const [showForm, setShowForm] = useState(false);
  // State to hold the invoice being edited or created
  const [currentInvoice, setCurrentInvoice] = useState(null);
  // State to control visibility of the NotesDrawer
  const [notesDrawerVisible, setNotesDrawerVisible] = useState(false);
  // State to hold invoices filtered by search term (passed to InvoiceList)
  const [filteredInvoices, setFilteredInvoices] = useState([]);

  // --- DEBUGGING NOTE: 'V is not defined' error ---
  // The variable 'V' is not found defined or used within this 'InvoiceDashboard.jsx' component's code.
  // Please check for any typos where 'V' might have been used instead of 'value', 'val', or another variable.
  // Also, ensure all necessary imports are present and correctly spelled in your full project setup.
  // --- END DEBUGGING NOTE ---

  // Handler for editing an existing invoice
  const handleEdit = (invoice) => {
    setCurrentInvoice(invoice); // Set the invoice to be edited
    setShowForm(true); // Show the invoice form drawer
  };

  // Function to fetch all invoices from the backend API
  const fetchInvoices = async () => {
    try {
      const res = await axios.get("/api/invoices"); // API call to get invoices
      setInvoices(res.data); // Update the invoices state
      setLoading(false); // End loading
    } catch (err) {
      console.error("Failed to fetch invoices:", err);
      message.error("Failed to fetch invoices"); // Display error message
      setLoading(false); // End loading even on error
    }
  };

  // useEffect hook to fetch invoices when the component mounts
  useEffect(() => {
    fetchInvoices();
  }, []); // Empty dependency array ensures it runs only once on mount

  // Handler for saving (creating or updating) an invoice
  const handleSave = async (invoiceData) => {
    try {
      console.log("Invoice data being sent:", invoiceData); // Log data for debugging

      if (currentInvoice && currentInvoice._id) {
        // If currentInvoice exists, it's an update operation
        await axios.put(`/api/invoices/${currentInvoice._id}`, invoiceData);
        message.success("Invoice updated successfully");
      } else {
        // Otherwise, it's a new invoice creation
        await axios.post("/api/invoices", invoiceData);
        message.success("Invoice created successfully");
      }
      fetchInvoices(); // Refresh the invoice list after save
      setShowForm(false); // Close the invoice form drawer
      setCurrentInvoice(null); // Clear current invoice
    } catch (err) {
      console.error("Error saving invoice:", err);
      // Log the full response data for more specific error messages from the backend
      console.error("Server error response:", err?.response?.data);
      message.error(err?.response?.data?.message || "Failed to save invoice");
    }
  };

  // Handler for deleting an invoice
  const handleDelete = async (id) => {
    try {
      setLoading(true); // Show loading indicator during deletion
      await axios.delete(`/api/invoices/${id}`); // API call to delete invoice
      message.success("Invoice deleted"); // Display success message
      fetchInvoices(); // Refresh the invoice list after deletion
    } catch (err) {
      console.error("Error deleting invoice:", err);
      message.error("Delete failed"); // Display error message
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };

  // Handler for searching invoices (used by InvoiceList component)
  const handleSearch = (text) => {
    const value = text.toLowerCase();
    const filtered = invoices.filter(
      (inv) =>
        inv?.businessName?.toLowerCase().includes(value) ||
        inv?.invoiceNumber?.toLowerCase().includes(value) ||
        inv?.customerName?.toLowerCase().includes(value)
    );
    setFilteredInvoices(filtered); // Update filtered invoices state
  };

  // Handler to close the InvoiceForm drawer
  const handleClose = () => {
    setShowForm(false); // Hide the form
    setCurrentInvoice(null); // Clear the current invoice
  };

  // Filter invoices to include only 'Invoice' type for dashboard statistics and charts
  const actualInvoices = invoices.filter(inv => inv.invoiceType === 'Invoice');

  // Calculate summary data ONLY FOR 'Invoice' types
  const totalInvoiceCount = actualInvoices.length;
  const totalInvoiceAmount = actualInvoices.reduce(
    (sum, invoice) => sum + (invoice.totalAmount || 0),
    0
  );

  // Assuming 'paymentStatus' or a way to derive it exists in your invoice objects
  // This logic now applies ONLY to 'Invoice' types
  const paidInvoiceCount = actualInvoices.filter(
    (invoice) => invoice.paymentStatus === "Paid"
  ).length;
  const pendingInvoiceCount = actualInvoices.filter(
    (invoice) => invoice.paymentStatus !== "Paid"
  ).length;

  // Prepare data for the line chart (total amount by date)
  // This aggregates the total amount for each unique creation date, ONLY FOR 'Invoice' types.
  const aggregatedChartData = actualInvoices.reduce((acc, invoice) => {
    // Extract date in YYYY-MM-DD format from 'createdAt' timestamp
    const date = invoice.createdAt
      ? new Date(invoice.createdAt).toISOString().split("T")[0]
      : "Unknown Date";
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date] += invoice.totalAmount || 0; // Add total amount for the date
    return acc;
  }, {});

  // Convert aggregated data into an array suitable for Recharts, then sort by date
  const chartData = Object.keys(aggregatedChartData)
    .map((date) => ({
      date: date,
      amount: aggregatedChartData[date],
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort data points chronologically

  // --- Action Handlers for Table Buttons (These are passed to InvoiceList) ---
  const handleViewInvoice = (invoiceId) => {
    // This function can be expanded to show a detailed view modal or navigate
    console.log("View Invoice:", invoiceId);
    message.info(`Viewing invoice ${invoiceId}`);
  };

  const handleEditInvoice = (invoiceId) => {
    // This function can be expanded to open the InvoiceForm with the selected invoice data
    console.log("Edit Invoice:", invoiceId);
    message.warning(`Editing invoice ${invoiceId}`);
    // You would typically find the invoice by ID and pass it to handleEdit
    const invoiceToEdit = invoices.find(inv => inv._id === invoiceId);
    if (invoiceToEdit) {
      handleEdit(invoiceToEdit);
    }
  };

  // Main render logic for the InvoiceDashboard component
  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <Spin size="large" tip="Loading invoice data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "red" }}>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <h1>Invoice Dashboard</h1>
      <p>
        Welcome to the Invoice Dashboard. Here you can manage your invoices.
        The statistics and chart below reflect only 'Invoice' type documents.
      </p>

      {/* Card Section - Displays key statistics for 'Invoice' type documents */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Invoices"
              value={totalInvoiceCount}
              valueStyle={{ color: "#3f8600" }}
              prefix={<RiseOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Amount"
              value={totalInvoiceAmount.toFixed(2)}
              prefix="₹"
              valueStyle={{ color: "#0050b3" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Paid Invoices"
              value={paidInvoiceCount}
              valueStyle={{ color: "#28a745" }}
              prefix={<RiseOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Pending Invoices"
              value={pendingInvoiceCount}
              valueStyle={{ color: "#faad14" }}
              prefix={<FallOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Chart Section - Line Graph showing 'Invoice' amounts over time */}
      <Card title="Invoice Amount Over Time" style={{ marginBottom: "24px" }}>
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => `₹ ${value.toFixed(2)}`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* InvoiceList Component - displays the table of all invoices */}
      <InvoiceList
        // Pass either filtered invoices or all invoices to InvoiceList
        invoices={filteredInvoices.length > 0 ? filteredInvoices : invoices}
        onAddNew={() => {
          setCurrentInvoice(null); // Ensure currentInvoice is null for new invoice
          setShowForm(true); // Show the form drawer for a new invoice
        }}
        onEdit={handleEdit} // Pass the handleEdit function to InvoiceList
        onDelete={handleDelete} // Pass the handleDelete function to InvoiceList
        onSearch={handleSearch} // Pass the handleSearch function to InvoiceList
        refreshInvoices={fetchInvoices} // Pass fetchInvoices to allow refreshing the list
        onViewNotes={(invoice) => {
          setCurrentInvoice(invoice);
          setNotesDrawerVisible(true);
        }}
        // The handleViewInvoice, handleEditInvoice, handleDeleteInvoice are also handled by
        // InvoiceList's internal action dropdown. If you wanted the dashboard to directly
        // trigger these, you would add corresponding props to InvoiceList and call them here.
      />

      {/* Drawer for InvoiceForm (Create/Edit Invoice) */}
      <Drawer
        title={currentInvoice ? 'Edit Invoice' : 'Create Invoice'}
        open={showForm}
        onClose={handleClose}
        width="80%"
        destroyOnClose // Destroy content on close to reset form state
      >
        <InvoiceForm
          onCancel={handleClose} // Pass close handler to form
          onSave={handleSave} // Pass save handler to form
          // Provide initial values for the form, including defaults for new invoices
          initialValues={currentInvoice || {
            invoiceType: 'Invoice', // Default to 'Invoice' type for new entries
            items: [], // Always ensure items array is present
            taxRate: 18,
            discountAmount: 0,
            // Add other default empty strings or values for denormalized fields
            businessName: '',
            customerName: '',
            customerAddress: '',
            customerGSTIN: '',
            companyGSTIN: '',
            companyName: '',
            companyAddress: '',
            contactPerson: '',
            contactNumber: '',
            paymentTerms: '',
          }}
        />
      </Drawer>

      {/* Notes Drawer (visible only if an invoice is selected for notes) */}
      {currentInvoice && (
        <NotesDrawer
          visible={notesDrawerVisible}
          onClose={() => setNotesDrawerVisible(false)}
          invoice={currentInvoice}
          refreshInvoices={fetchInvoices} // Allows NotesDrawer to refresh main list
        />
      )}
    </div>
  );
};

export default InvoiceDashboard;
