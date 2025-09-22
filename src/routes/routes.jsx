// File: src/routes/routes.jsx

import React from 'react';
import RoleGuard from '../components/auth/RoleGuard';
import EnquiryInnerPage from '../pages/leads/EnquiryInnerPage';

// Lazy-loaded pages
const Dashboard = React.lazy(() => import('../pages/dashboard/Dashboard'));
const InvoiceDashboard = React.lazy(() => import('../pages/invoice/invoicedashboard'));
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
const Customers = React.lazy(() => import('../pages/leads/Customers'));
const CustomerProfile = React.lazy(() => import('../components/CustomerProfile'));

const UserManagement = React.lazy(() => import('../pages/user/UserManagement'));
const DepartmentManagement = React.lazy(() => import('../pages/user/DepartmentManagement'));
const TeamManagement = React.lazy(() => import('../pages/user/TeamManagement'));

const CombinedManagement = React.lazy(() => import('../pages/user/CombinedManagement'));

const Product = React.lazy(() => import('../pages/product/Product'));
const ZoneView = React.lazy(() => import('../pages/leads/ZoneView'));

// Protected app routes
export const appRoutes = [
  {
    path: '/dashboard',
    element: (
      <RoleGuard allowedRoles={['Admin', 'Superadmin','Employee',  'Team Leader']}>
        <Dashboard />
      </RoleGuard>
    ),
  },
  {
    path: '/invoicedashboard',
    element: (
      <RoleGuard allowedRoles={['Admin', 'Superadmin',  'Team Leader']}>
        <InvoiceDashboard />
      </RoleGuard>
    ),
  },
  {
    path: '/profile',
    element: (
      <RoleGuard allowedRoles={['Admin', 'Superadmin', 'Employee', 'Team Leader']}>
        <Profile />
      </RoleGuard>
    ),
  },
  {
    path: '/settings',
    element: (
      <RoleGuard allowedRoles={['Admin', 'Superadmin', 'Employee', 'Team Leader']}>
        <Settings />
      </RoleGuard>
    ),
  },
  {
    path: '/leads',
    element: (
      <RoleGuard allowedRoles={['Admin', 'Superadmin' , 'Team Leader', 'Employee', "QTTEAM"]}>
        <Leads />
      </RoleGuard>
    ),
  },
   {
    path: '/leads/enquiry/:id',
    element: (
      <RoleGuard allowedRoles={['Admin', 'Superadmin' , 'Team Leader', 'Employee',"QTTEAM"]}>
        <EnquiryInnerPage/>
      </RoleGuard>
    ),
  },
  {
    path: '/customers',
    element: (
      <RoleGuard allowedRoles={['Admin', 'Superadmin' , 'Team Leader', 'Employee']}>
        <Customers />
      </RoleGuard>
    ),
  },
  {
    path: '/zone-view',
    element: (
      <RoleGuard allowedRoles={['Admin', 'Superadmin' , 'Team Leader', 'Employee']}>
        <ZoneView />
      </RoleGuard>
    ),
  },
  {
    path: '/customers/:id',
    element: (
      <RoleGuard allowedRoles={['Admin', 'Superadmin' , 'Team Leader', 'Employee']}>
        <CustomerProfile />
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
    path: '/products',
    element: (
      <RoleGuard allowedRoles={['Admin', 'Superadmin' , 'Team Leader']}>
        <Product />
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
      <RoleGuard allowedRoles={['Admin', 'Superadmin' , 'Team Leader']}>
        <QuotationPage />
      </RoleGuard>
    ),
  },
  {
    path: '/quotation/form',
    element: (
      <RoleGuard allowedRoles={['Admin', 'Superadmin' , 'Team Leader']}>
        <QuotationForm />
      </RoleGuard>
    ),
  },
  {
    path: '/quotation/list',
    element: (
      <RoleGuard allowedRoles={['Admin', 'Superadmin' , 'Team Leader']}>
        <QuotationList />
      </RoleGuard>
    ),
  },
  {
    path: '/management',
    element: (
      <RoleGuard allowedRoles={['Superadmin', 'Admin']}>
        <CombinedManagement />
      </RoleGuard>
    ),
  }
];

// Public login routes
export const loginRoutes = [
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <Login />
  },
];