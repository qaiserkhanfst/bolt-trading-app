import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bars3Icon, BellIcon, UserIcon, CogIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const Header = ({ toggleSidebar }) => {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);
  
  // Mock notifications data
  const notifications = [
    {
      id: 1,
      title: 'New BTC signal',
      message: 'AI detected a BUY signal for BTC',
      time: '5 minutes ago',
      read: false
    },
    {
      id: 2,
      title: 'Trade executed',
      message: 'Your ETH trade has been executed successfully',
      time: '1 hour ago',
      read: false
    },
    {
      id: 3,
      title: 'Take profit hit',
      message: 'Your SOL trade hit take profit target',
      time: '3 hours ago',
      read: true
    }
  ];
  
  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  
  return (
    <header className="bg-gray-800 border-b border-gray-700 py-3 px-4 sm:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            type="button"
            className="text-gray-400 hover:text-white focus:outline-none md:hidden"
            onClick={toggleSidebar}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          
          <Link to="/" className="ml-4 md:ml-0 flex items-center">
            <span className="bg-blue-600 p-1 rounded">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M6.5 9a4.5 4.5 0 0 1 9 0c0 .346-.043.682-.125 1h-1.536A3 3 0 1 0 10.5 9H13a5.5 5.5 0 1 1-6.5 0Z" />
                <path d="M10.586 1.586A2 2 0 0 0 9.172 1H3a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h.172a2 2 0 0 0 1.414-.586L8 9l-.001 9.586a2 2 0 0 0 2.002 2.002h10.001a2 2 0 0 0 2-2V11a2 2 0 0 0-2-2h-2.587a2.001 2.001 0 0 0-1.414.586L13.586 12l3.415-3.415A2.001 2.001 0 0 0 17 7Z" />
              </svg>
            </span>
            <span className="ml-2 font-bold text-xl">CryptoAI Trader</span>
          </Link>
        </div>
        
        <div className="flex items-center">
          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              type="button"
              className="p-2 rounded-full text-gray-400 hover:text-white focus:outline-none relative"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
            >
              <BellIcon className="h-6 w-6" />
              {notifications.some(n => !n.read) && (
                <span className="absolute top-1 right-1.5 block w-2 h-2 rounded-full bg-red-500"></span>
              )}
            </button>
            
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
                <div className="p-3 border-b border-gray-700">
                  <h3 className="text-white font-medium">Notifications</h3>
                </div>
                
                <div className="max-h-60 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={`p-3 border-b border-gray-700 hover:bg-gray-700 cursor-pointer ${
                          !notification.read ? 'bg-gray-750' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-white font-medium">{notification.title}</p>
                            <p className="text-gray-400 text-sm">{notification.message}</p>
                            <p className="text-gray-500 text-xs mt-1">{notification.time}</p>
                          </div>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-1"></span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center text-gray-400">
                      No notifications
                    </div>
                  )}
                </div>
                
                <div className="p-2 text-center border-t border-gray-700">
                  <Link 
                    to="/notifications" 
                    className="text-blue-500 text-sm hover:text-blue-400"
                    onClick={() => setNotificationsOpen(false)}
                  >
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          {/* User Menu */}
          <div className="relative ml-3" ref={userMenuRef}>
            <button
              type="button"
              className="flex items-center text-gray-300 hover:text-white focus:outline-none"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <div className="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center">
                {currentUser.photoURL ? (
                  <img 
                    src={currentUser.photoURL} 
                    alt={currentUser.displayName || 'User'} 
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <UserIcon className="h-5 w-5 text-gray-300" />
                )}
              </div>
              <span className="ml-2 hidden md:block">
                {currentUser.displayName || 'User'}
              </span>
              <svg className="ml-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
                <div className="py-1">
                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <CogIcon className="h-5 w-5 mr-2" />
                    Settings
                  </Link>
                  
                  <button
                    className="flex items-center w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white"
                    onClick={handleLogout}
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;