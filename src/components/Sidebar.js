import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Store, Users, CreditCard, Megaphone, 
  FileText, Settings, Wallet, QrCode, Gift, LogOut,
  Building, Award, ChevronDown, ChevronRight, Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout, isAdmin, isMerchant } = useAuth();
  const [expandedMenus, setExpandedMenus] = React.useState(['dashboard']);

  const toggleMenu = (menu) => {
    setExpandedMenus(prev => 
      prev.includes(menu) 
        ? prev.filter(m => m !== menu)
        : [...prev, menu]
    );
  };

  const adminMenuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/admin/dashboard',
      subItems: [
        { label: 'Overview', path: '/admin/dashboard' }
      ]
    },
    {
      id: 'merchants',
      label: 'Merchants',
      icon: Store,
      subItems: [
        { label: 'All Merchants', path: '/admin/merchants' },
        { label: 'Pending Approvals', path: '/admin/merchants/pending' },
        { label: 'Categories', path: '/admin/merchants/categories' }
      ]
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: Users,
      subItems: [
        { label: 'All Customers', path: '/admin/customers' }
      ]
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: CreditCard,
      subItems: [
        { label: 'All Transactions', path: '/admin/transactions' }
      ]
    },
    {
      id: 'marketing',
      label: 'Marketing',
      icon: Megaphone,
      subItems: [
        { label: 'Banners', path: '/admin/marketing/banners' },
        // { label: 'Promos', path: '/admin/marketing/promos' },
        { label: 'Loyalty Levels', path: '/admin/marketing/loyalty-levels' }
      ]
    },
    {
      id: 'cms',
      label: 'CMS Pages',
      icon: FileText,
      subItems: [
        { label: 'CMS', path: '/admin/cms/terms' },
        // { label: 'Privacy Policy', path: '/admin/cms/privacy' },
        // { label: 'Help & Support', path: '/admin/cms/help' },
        // { label: 'Program Rules', path: '/admin/cms/rules' }
      ]
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: '/admin/settings'
    }
  ];

  const merchantMenuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/merchant/dashboard'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: Building,
      subItems: [
        { label: 'Business Info', path: '/merchant/profile/business' },
        { label: 'Logo & Banner', path: '/merchant/profile/media' },
        // { label: 'Business Hours', path: '/merchant/profile/hours' },
        // { label: 'Reward Settings', path: '/merchant/profile/rewards' }
      ]
    },
    {
      id: 'wallet',
      label: 'Wallet',
      icon: Wallet,
      subItems: [
        { label: 'Balance', path: '/merchant/wallet' },
        // { label: 'Top-up', path: '/merchant/wallet/topup' }
      ]
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: CreditCard,
      subItems: [
        { label: 'All Transactions', path: '/merchant/transactions' }
      ]
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: Users,
      path: '/merchant/customers'
    },
    {
      id: 'promos',
      label: 'Promos',
      icon: Gift,
      subItems: [
        { label: 'My Promos', path: '/merchant/promos' },
        { label: 'Create Promo', path: '/merchant/promos/create' }
      ]
    },
    {
      id: 'qr-scanner',
      label: 'QR Scanner',
      icon: QrCode,
      subItems: [
        { label: 'Scan QR', path: '/merchant/qr-scanner' },
        // { label: 'Scan History', path: '/merchant/qr-scanner/history' }
      ]
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: '/merchant/settings'
    }
  ];

  const menuItems = isAdmin ? adminMenuItems : merchantMenuItems;

  const MenuItem = ({ item }) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isExpanded = expandedMenus.includes(item.id);

    if (!hasSubItems) {
      return (
        <NavLink
          to={item.path}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-300 ${
              isActive 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700'
            }`
          }
          onClick={() => setIsOpen(false)}
        >
          <item.icon className="w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
          <span>{item.label}</span>
        </NavLink>
      );
    }

    return (
      <div>
        <button
          onClick={() => toggleMenu(item.id)}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 transition-all duration-300 font-medium"
        >
          <item.icon className="w-5 h-5 flex-shrink-0 transition-transform duration-300 hover:scale-110" />
          <span className="flex-1 text-left">{item.label}</span>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 transition-transform duration-300" />
          ) : (
            <ChevronRight className="w-4 h-4 transition-transform duration-300" />
          )}
        </button>
        
        {isExpanded && (
          <div className="ml-4 mt-2 space-y-1 animate-fade-in">
            {item.subItems.map((subItem, idx) => (
              <NavLink
                key={idx}
                to={subItem.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 font-semibold shadow-sm'
                      : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                  }`
                }
                onClick={() => setIsOpen(false)}
              >
                <div className="w-2 h-2 rounded-full bg-current"></div>
                <span>{subItem.label}</span>
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-white/95 backdrop-blur-xl shadow-2xl transition-transform duration-300 border-r border-gray-200/50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:sticky lg:top-0 w-72 flex flex-col`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200/60">
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-105 ${
              isAdmin 
                ? 'bg-gradient-to-br from-blue-600 to-indigo-600' 
                : 'bg-gradient-to-br from-purple-600 to-pink-600'
            }`}>
              {isAdmin ? (
                <Award className="w-6 h-6 text-white" />
              ) : (
                <Store className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                {isAdmin ? 'Admin Panel' : 'Merchant Portal'}
              </h1>
              <div className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-500" />
                <p className="text-xs text-gray-500">Loyalty System</p>
              </div>
            </div>
          </div>
          
          {/* User Info Card */}
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 transition-all duration-300 hover:shadow-md">
            <div className="relative">
              {/* <img
                src={user?.avatar}
                alt={user?.name}
                className="w-11 h-11 rounded-full border-2 border-white shadow-lg"
              /> */}
              {/* <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div> */}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-900 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {menuItems.map((item) => (
            <MenuItem key={item.id} item={item} />
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200/60">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-all duration-300 font-medium group"
          >
            <LogOut className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;