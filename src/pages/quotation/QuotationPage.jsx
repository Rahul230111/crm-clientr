import React, { useState, useEffect } from 'react';
import { Drawer } from 'antd';
import axios from '../../api/axios'; // ✅ Use your custom axios instance with baseURL
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

  const fetchQuotations = async () => {
    const toastId = toast.loading('Loading quotations...');
    try {
      const res = await axios.get('/api/quotations');
      setQuotations(res.data);
      toast.success('Quotations loaded successfully', { id: toastId });
    } catch (err) {
      toast.error('Failed to load quotations', { id: toastId });
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const handleSave = async (data) => {
    const toastId = toast.loading('Saving quotation...');
    try {
      if (currentQuotation) {
        await axios.put(`/api/quotations/${currentQuotation._id}`, data);
      } else {
        await axios.post('/api/quotations', data);
      }
      toast.success('Quotation saved successfully!', { id: toastId });
      fetchQuotations();
      setDrawerVisible(false);
      setCurrentQuotation(null);
    } catch (err) {
      toast.error(`Failed to save quotation: ${err.message}`, { id: toastId });
    }
  };

  const handleDelete = async (id) => {
    const toastId = toast.loading('Deleting quotation...');
    try {
      await axios.delete(`/api/quotations/${id}`);
      toast.success('Quotation deleted successfully', { id: toastId });
      fetchQuotations();
    } catch (err) {
      toast.error(`Failed to delete quotation: ${err.message}`, { id: toastId });
    }
  };

  const handleSearch = (value) => {
    const val = value.toLowerCase();
    const result = quotations.filter(q =>
      q.businessName?.toLowerCase().includes(val) ||
      q.customerName?.toLowerCase().includes(val) ||
      q.quotationNumber?.toLowerCase().includes(val)
    );
    setFiltered(result);
  };

  return (
    <>
      <QuotationList
        quotations={filtered.length ? filtered : quotations}
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
      />

      <Drawer
        open={drawerVisible}
        title={currentQuotation ? 'Edit Quotation' : 'Create Quotation'}
        onClose={() => {
          setDrawerVisible(false);
          setCurrentQuotation(null);
        }}
        width={720}
        destroyOnClose
      >
        <QuotationForm
          initialValues={currentQuotation}
          onSave={handleSave}
          onCancel={() => {
            setDrawerVisible(false);
            setCurrentQuotation(null);
          }}
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
