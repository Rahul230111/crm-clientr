// InvoicePage.jsx
import { useState, useEffect } from 'react';
import { Drawer, message } from 'antd';
import InvoiceList from './InvoiceList';
import InvoiceForm from './InvoiceForm';

const InvoicePage = () => {
  const [invoices, setInvoices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [filteredInvoices, setFilteredInvoices] = useState([]);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/invoices');
      const data = await res.json();
      setInvoices(data);
    } catch (err) {
      message.error('Failed to fetch invoices');
    }
  };

  const handleSave = async (invoiceData) => {
    try {
      const method = currentInvoice ? 'PUT' : 'POST';
      const url = currentInvoice ? `/api/invoices/${currentInvoice._id}` : '/api/invoices';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData)
      });
      const data = await res.json();
      if (res.ok) {
        message.success(currentInvoice ? 'Invoice updated' : 'Invoice created');
        fetchInvoices();
        setShowForm(false);
        setCurrentInvoice(null);
      } else {
        throw new Error(data.error || 'Failed to save');
      }
    } catch (err) {
      message.error(err.message);
    }
  };

  const handleEdit = (invoice) => {
    setCurrentInvoice(invoice);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
      message.success('Invoice deleted');
      fetchInvoices();
    } catch {
      message.error('Delete failed');
    }
  };

  const handleAddNew = () => {
    setShowForm(true);
    setCurrentInvoice(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setCurrentInvoice(null);
  };

  const handleSearch = (term) => {
    if (!term) return setFilteredInvoices([]);
    const lower = term.toLowerCase();
    const result = invoices.filter(inv =>
      inv.businessName?.toLowerCase().includes(lower) ||
      inv.invoiceNumber?.toLowerCase().includes(lower) ||
      inv.customerName?.toLowerCase().includes(lower)
    );
    setFilteredInvoices(result);
  };

  return (
    <div style={{ padding: 24 }}>
      <InvoiceList
        invoices={filteredInvoices.length > 0 ? filteredInvoices : invoices}
        onAddNew={handleAddNew}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSearch={handleSearch}
        refreshInvoices={fetchInvoices}
      />

      <Drawer
        title={currentInvoice ? 'Edit Invoice' : 'New Invoice'}
        width={800}
        open={showForm}
        onClose={handleCancel}
        destroyOnClose
      >
        <InvoiceForm
          onCancel={handleCancel}
          onSave={handleSave}
          initialValues={currentInvoice}
        />
      </Drawer>
    </div>
  );
};

export default InvoicePage;
