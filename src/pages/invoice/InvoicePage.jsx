import { useState } from 'react';
import InvoiceList from './InvoiceList';
import InvoiceForm from './InvoiceForm';

const InvoicePage = () => {
  const [invoices, setInvoices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(null);

  const handleSave = (invoiceData) => {
    if (currentInvoice) {
      // Update existing invoice
      setInvoices(invoices.map(inv => 
        inv.id === currentInvoice.id ? { ...invoiceData, id: currentInvoice.id } : inv
      ));
    } else {
      // Add new invoice
      setInvoices([...invoices, { ...invoiceData, id: Date.now() }]);
    }
    setShowForm(false);
    setCurrentInvoice(null);
  };

  const handleEdit = (invoice) => {
    setCurrentInvoice(invoice);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setInvoices(invoices.filter(invoice => invoice.id !== id));
  };

  return (
    <div style={{ padding: '24px' }}>
      {showForm ? (
        <InvoiceForm 
          onCancel={() => {
            setShowForm(false);
            setCurrentInvoice(null);
          }}
          onSave={handleSave}
          initialValues={currentInvoice}
        />
      ) : (
        <InvoiceList 
          invoices={invoices}
          onAddNew={() => setShowForm(true)}
          onView={(invoice) => console.log('View:', invoice)}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default InvoicePage;