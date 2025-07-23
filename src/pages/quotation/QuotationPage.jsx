// QuotationPage.jsx
import React, { useState, useEffect } from "react";
import { Drawer } from "antd";
import axios from "../../api/axios";
import toast from "react-hot-toast";
import QuotationForm from "./QuotationForm";
import QuotationList from "./QuotationList";
import NotesDrawer from "./NotesDrawer";

const QuotationPage = () => {
  const [quotations, setQuotations] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [currentQuotation, setCurrentQuotation] = useState(null);
  const [filtered, setFiltered] = useState([]);
  const [notesDrawerVisible, setNotesDrawerVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const fetchQuotations = async () => {
    setLoading(true);
    const toastId = toast.loading("Loading quotations...");
    try {
      // Pass page and limit as query parameters
      const res = await axios.get(`/api/quotations?page=${currentPage}&limit=${pageSize}`);
      setQuotations(res.data.quotations); // Update to get quotations from res.data.quotations
      setFiltered(res.data.quotations); // Update filtered as well
      setTotalItems(res.data.totalItems); // Set total items for pagination component
      toast.success("Quotations loaded successfully", { id: toastId });
    } catch (err) {
      toast.error("Failed to load quotations", { id: toastId });
      console.error("Error fetching quotations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, [currentPage, pageSize]); // Re-fetch when currentPage or pageSize changes

  const handlePageChange = (page, limit) => {
    setCurrentPage(page);
    setPageSize(limit);
  };

  const handleSave = async (data) => {
    if (isSaving) {
      toast("Quotation save in progress. Please wait...", { icon: "⏳" });
      return;
    }
    setIsSaving(true);

    const toastId = toast.loading("Saving quotation...");
    try {
      if (currentQuotation) {
        await axios.put(`/api/quotations/${currentQuotation._id}`, data);
      } else {
        await axios.post("/api/quotations", data);
      }
      toast.success("Quotation saved successfully!", { id: toastId });
      await fetchQuotations(); // Refresh list after saving
      setDrawerVisible(false); // Close the drawer
      setCurrentQuotation(null); // Reset current quotation
    } catch (err) {
      console.error("Error saving quotation:", err.response?.data || err);
      toast.error(
        `Failed to save quotation: ${
          err.response?.data?.error || err.message || "Unknown error"
        }`,
        { id: toastId }
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const toastId = toast.loading("Deleting quotation...");
    try {
      await axios.delete(`/api/quotations/${id}`);
      toast.success("Quotation deleted successfully", { id: toastId });
      fetchQuotations(); // Refresh list after deletion
    } catch (err) {
      toast.error(`Failed to delete quotation: ${err.message}`, {
        id: toastId,
      });
      console.error("Error deleting quotation:", err);
    }
  };

  // Modify handleSearch to filter *all* quotations, not just the current page
  const handleSearch = (value) => {
    const val = value.toLowerCase();
    // This will still filter the `quotations` state which currently only holds one page of data.
    // For proper server-side search with pagination, you'd send the search term to the backend.
    const result = quotations.filter(
      (q) =>
        q.businessName?.toLowerCase().includes(val) ||
        q.customerName?.toLowerCase().includes(val) ||
        q.quotationNumber?.toLowerCase().includes(val) ||
        q.notes?.some((note) => note.text?.toLowerCase().includes(val))
    );
    setFiltered(result);
  };


  return (
    <>
      <h2>Quotation </h2>
      <QuotationList
        quotations={filtered} // Always pass filtered results
        onAddNew={() => {
          setCurrentQuotation(null);
          setDrawerVisible(true);
        }}
        onEdit={(quotation) => {
          setCurrentQuotation(quotation);
          setDrawerVisible(true);
        }}
        onDelete={handleDelete}
        onSearch={handleSearch}
        onViewNotes={(quotation) => {
          setCurrentQuotation(quotation);
          setNotesDrawerVisible(true);
        }}
        loading={loading}
        // Pass pagination props to QuotationList
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: totalItems,
          onChange: handlePageChange,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} quotations`,
        }}
      />

      <Drawer
        open={drawerVisible}
        title={currentQuotation ? "Edit Quotation" : "Create Quotation"}
        onClose={() => {
          setDrawerVisible(false);
          setCurrentQuotation(null);
        }}
        width={window.innerWidth > 768 ? "80vw" : "95vw"}
        destroyOnClose
      >
        <QuotationForm
          initialValues={currentQuotation}
          onSave={handleSave}
          onCancel={() => {
            setDrawerVisible(false);
            setCurrentQuotation(null);
          }}
          isSaving={isSaving}
        />
      </Drawer>

      <NotesDrawer
        visible={notesDrawerVisible}
        onClose={() => {
          setNotesDrawerVisible(false);
          setCurrentQuotation(null);
        }}
        quotation={currentQuotation}
        refreshQuotations={fetchQuotations}
      />
    </>
  );
};

export default QuotationPage;