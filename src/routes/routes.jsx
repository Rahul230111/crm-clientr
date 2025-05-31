import React from 'react';
import RoleGuard from '../components/auth/RoleGuard';

const Dashboard = React.lazy(() => import('../pages/Dashboard'));
const Login = React.lazy(() => import('../pages/Login'));
const Profile = React.lazy(() => import('../pages/Profile'));
const Settings = React.lazy(() => import('../pages/Settings'));
const QuotationPage = React.lazy(() => import('../pages/quotation/QuotationPage'));
const QuotationForm = React.lazy(() => import('../pages/quotation/QuotationForm'));
const QuotationList = React.lazy(() => import('../pages/quotation/QuotationList'));

import InvoicePage from '../pages/Invoice/InvoicePage';
import InvoiceForm from '../pages/Invoice/InvoiceForm';
import InvoiceList from '../pages/Invoice/InvoiceList';
import Leads from '../pages/leads/Leads';
import UserManagement from '../pages/user/UserManagement';
import ProductList from '../pages/product/ProductList';
import ProductForm from '../pages/product/ProductForm';
import ProductPage from '../pages/product/ProductPage';

export const routes = [
  { path: '/', element: <Dashboard /> },
  { path: '/login', element: <Login /> },
  { path: '/profile', element: <Profile /> },
  { path: '/settings', element: <Settings /> },

  // Accessible only to Admin & Superadmin
  {
    path: '/leads',
    element: (
      <RoleGuard allowedRoles={['Admin', 'Superadmin']}>
        <Leads />
      </RoleGuard>
    )
  },
  {
    path: '/invoice',
    element: (
      <RoleGuard allowedRoles={['Admin', 'Superadmin']}>
        <InvoicePage />
      </RoleGuard>
    )
  },
  {
    path: '/invoice/form',
    element: (
      <RoleGuard allowedRoles={['Admin', 'Superadmin']}>
        <InvoiceForm />
      </RoleGuard>
    )
  },
  {
    path: '/invoice/list',
    element: (
      <RoleGuard allowedRoles={['Admin', 'Superadmin']}>
        <InvoiceList />
      </RoleGuard>
    )
  },
  {
    path: '/quotation',
    element: (
      <RoleGuard allowedRoles={['Admin', 'Superadmin']}>
        <QuotationPage />
      </RoleGuard>
    )
  },
  {
    path: '/quotation/form',
    element: (
      <RoleGuard allowedRoles={['Admin', 'Superadmin']}>
        <QuotationForm />
      </RoleGuard>
    )
  },
  {
    path: '/quotation/list',
    element: (
      <RoleGuard allowedRoles={['Admin', 'Superadmin']}>
        <QuotationList />
      </RoleGuard>
    )
  },
  {
    path: '/users',
    element: (
      <RoleGuard allowedRoles={['Superadmin']}>
        <UserManagement />
      </RoleGuard>
    )
  },
  {
    path: '/products',
    element: (
      <RoleGuard allowedRoles={['Admin', 'Superadmin']}>
        <ProductList />
      </RoleGuard>
    )
  },
];
