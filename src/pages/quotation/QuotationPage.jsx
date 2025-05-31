import React, { useState, useEffect } from 'react';
import { Drawer } from 'antd';
import axios from 'axios';
import toast from 'react-hot-toast';
import QuotationForm from './QuotationForm';
import QuotationList from './QuotationList';
import NotesDrawer from './NotesDrawer';

const QuotationPage = () => {
  const [quotations, setQuotations] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [currentQuotation, setCurrentQuotation] = useState(null);
  const [filtered, setFiltered] = useState([]);
  const [notesDrawerVisible, setNotesDrawerVisible] = useState(false);

  const fetchQuotations = () => {
    const toastId = toast.loading('Loading quotations...');
    axios.get("/api/quotations")
      .then(res => {
        setQuotations(res.data);
        toast.success('Quotations loaded successfully', { id: toastId });
      })
      .catch(() => {
        toast.error("Failed to load quotations", { id: toastId });
      });
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const handleSave = (data) => {
    const toastId = toast.loading('Saving quotation...');
    const request = currentQuotation
      ? axios.put(`/api/quotations/${currentQuotation._id}`, data)
      : axios.post("/api/quotations", data);

    request.then(() => {
      fetchQuotations();
      toast.success("Quotation saved successfully!", { id: toastId });
      setDrawerVisible(false);
      setCurrentQuotation(null);
    })
    .catch(error => {
      toast.error(`Failed to save quotation: ${error.message}`, { id: toastId });
    });
  };

  const handleSearch = (val) => {
    const lower = val.toLowerCase();
    const results = quotations.filter(q =>
      q.businessName?.toLowerCase().includes(lower) ||
      q.customerName?.toLowerCase().includes(lower) ||
      q.quotationNumber?.toLowerCase().includes(lower)
    );
    setFiltered(results);
  };

  return (
    <>
      <QuotationList
        quotations={filtered.length ? filtered : quotations}
        onAddNew={() => setDrawerVisible(true)}
        onEdit={(q) => {
          setCurrentQuotation(q);
          setDrawerVisible(true);
        }}
        onDelete={(id) => {
          const toastId = toast.loading('Deleting quotation...');
          axios.delete(`/api/quotations/${id}`)
            .then(() => {
              fetchQuotations();
              toast.success("Quotation deleted successfully", { id: toastId });
            })
            .catch(error => {
              toast.error(`Failed to delete quotation: ${error.message}`, { id: toastId });
            });
        }}
        onSearch={handleSearch}
        onViewNotes={(quotation) => {
          setCurrentQuotation(quotation);
          setNotesDrawerVisible(true);
        }}
      />

      <Drawer
        open={drawerVisible}
        title={currentQuotation ? "Edit Quotation" : "Create Quotation"}
        onClose={() => {
          setDrawerVisible(false);
          setCurrentQuotation(null);
        }}
        width={720}
        destroyOnClose
      >
        <QuotationForm
          initialValues={currentQuotation}
          onCancel={() => {
            setDrawerVisible(false);
            setCurrentQuotation(null);
          }}
          onSave={handleSave}
        />
      </Drawer>

      <NotesDrawer
        visible={notesDrawerVisible}
        onClose={() => setNotesDrawerVisible(false)}
        quotation={currentQuotation}
        refreshQuotations={fetchQuotations}
      />
    </>
  );
};

export default QuotationPage;