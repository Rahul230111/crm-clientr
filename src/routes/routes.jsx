import React from 'react';
import InvoicePage from '../pages/invoice/InvoicePage';
import InvoiceForm from '../pages/invoice/InvoiceForm';
import InvoiceList from '../pages/invoice/InvoiceList';
import Leads from '../pages/leads/Leads';

// Lazy-load pages
const Dashboard = React.lazy(() => import('../pages/Dashboard'));
const Login = React.lazy(() => import('../pages/Login'));
const Profile = React.lazy(() => import('../pages/Profile'));
const Settings = React.lazy(() => import('../pages/Settings'));

// Define routes
export const routes = [
  { path: '/', element: <Dashboard /> },
  { path: '/leads', element: <Leads /> },
  { path: '/login', element: <Login /> },
  { path: '/profile', element: <Profile /> },
  { path: '/settings', element: <Settings /> },
  { path: '/invoice', element: <InvoicePage /> },
  { path: '/invoiceform', element: <InvoiceForm /> },
  { path: '/invoicelist', element: <InvoiceList /> },
];
