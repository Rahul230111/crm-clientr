// routes.jsx
import React from 'react';
import RoleGuard from '../components/auth/RoleGuard';

const Dashboard = React.lazy(() => import('../pages/Dashboard'));
const Login = React.lazy(() => import('../pages/Login'));
const Profile = React.lazy(() => import('../pages/Profile'));
const Settings = React.lazy(() => import('../pages/Settings'));

const QuotationPage = React.lazy(() => import('../pages/quotation/QuotationPage'));
const QuotationForm = React.lazy(() => import('../pages/quotation/QuotationForm'));
const QuotationList = React.lazy(() => import('../pages/quotation/QuotationList'));

const InvoicePage = React.lazy(() => import('../pages/Invoice/InvoicePage'));
const InvoiceForm = React.lazy(() => import('../pages/Invoice/InvoiceForm'));
const InvoiceList = React.lazy(() => import('../pages/Invoice/InvoiceList'));

const Leads = React.lazy(() => import('../pages/leads/Leads'));
const Customers = React.lazy(() => import('../pages/leads/Customers')); // ✅ ADD THIS
const UserManagement = React.lazy(() => import('../pages/user/UserManagement'));

const ProductList = React.lazy(() => import('../pages/product/ProductList'));
const ProductForm = React.lazy(() => import('../pages/product/ProductForm'));
const ProductPage = React.lazy(() => import('../pages/product/ProductPage'));

export const appRoutes = [
  {
    path: '/dashboard',
    element: (
      <RoleGuard allowedRoles={['Admin', 'Superadmin', 'Employee']}>
        <Dashboard />
      </RoleGuard>
    ),
  },
  {
    path: '/profile',
    element: (
      <RoleGuard allowedRoles={['Admin', 'Superadmin', 'Employee']}>
        <Profile />
      </RoleGuard>
    ),
  },
  {
    path: '/settings',
    element: (
      <RoleGuard allowedRoles={['Admin', 'Superadmin', 'Employee']}>
        <Settings />
      </RoleGuard>
    ),
  },
  {
    path: '/leads',
    element: (
      <RoleGuard allowedRoles={['Admin', 'Superadmin']}>
        <Leads />
      </RoleGuard>
    ),
  },
  {
    path: '/customers', // ✅ ADD THIS
    element: (
      <RoleGuard allowedRoles={['Admin', 'Superadmin']}>
        <Customers />
      </RoleGuard>
    ),
  },
  {
    path: '/invoice',
    element: (
      <RoleGuard allowedRoles={['Admin', 'Superadmin']}>
        <InvoicePage />
      </RoleGuard>
    ),
  },
  {
    path: '/invoice/form',
    element: (
      <RoleGuard allowedRoles={['Admin', 'Superadmin']}>
        <InvoiceForm />
      </RoleGuard>
    ),
  },
  {
    path: '/invoice/list',
    element: (
      <RoleGuard allowedRoles={['Admin', 'Superadmin']}>
        <InvoiceList />
      </RoleGuard>
    ),
  },
  {
    path: '/quotation',
    element: (
      <RoleGuard allowedRoles={['Admin', 'Superadmin']}>
        <QuotationPage />
      </RoleGuard>
    ),
  },
  {
    path: '/quotation/form',
    element: (
      <RoleGuard allowedRoles={['Admin', 'Superadmin']}>
        <QuotationForm />
      </RoleGuard>
    ),
  },
  {
    path: '/quotation/list',
    element: (
      <RoleGuard allowedRoles={['Admin', 'Superadmin']}>
        <QuotationList />
      </RoleGuard>
    ),
  },
  {
    path: '/users',
    element: (
      <RoleGuard allowedRoles={['Superadmin']}>
        <UserManagement />
      </RoleGuard>
    ),
  },
  {
    path: '/products',
    element: (
      <RoleGuard allowedRoles={['Admin', 'Superadmin']}>
        <ProductList />
      </RoleGuard>
    ),
  },
  {
    path: '/products/form',
    element: (
      <RoleGuard allowedRoles={['Admin', 'Superadmin']}>
        <ProductForm />
      </RoleGuard>
    ),
  },
  {
    path: '/products/page',
    element: (
      <RoleGuard allowedRoles={['Admin', 'Superadmin']}>
        <ProductPage />
      </RoleGuard>
    ),
  },
];

export const loginRoutes = [
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <Login />,
  },
];
