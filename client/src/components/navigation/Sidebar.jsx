import { NavLink } from 'react-router-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { HomeIcon, ChartBarIcon, MagnifyingGlassIcon, WalletIcon, Cog6ToothIcon } from '@heroicons/react/24/solid';

const Sidebar = ({ open, setOpen }) => {
  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Trading View', href: '/trading', icon: ChartBarIcon },
    { name: 'Analysis', href: '/analysis', icon: MagnifyingGlassIcon },
    { name: 'Portfolio', href: '/portfolio', icon: WalletIcon },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon }
  ];
  
  return (
    <>
      {/* Mobile sidebar backdrop */}
      {open && (
        <div 
          className="fixed inset-0 z-20 bg-gray-900 bg-opacity-50 transition-opacity md:hidden"
          onClick={() => setOpen(false)}
        ></div>
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-30 h-full w-64 bg-gray-800 border-r border-gray-700 transition-transform transform 
        md:translate-x-0 md:static md:h-screen md:z-auto
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col py-4">
          {/* Sidebar header with close button for mobile */}
          <div className="px-4 flex items-center justify-between">
            <div className="flex items-center">
              <span className="bg-blue-600 p-1 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M6.5 9a4.5 4.5 0 0 1 9 0c0 .346-.043.682-.125 1h-1.536A3 3 0 1 0 10.5 9H13a5.5 5.5 0 1 1-6.5 0Z" />
                  <path d="M10.586 1.586A2 2 0 0 0 9.172 1H3a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h.172a2 2 0 0 0 1.414-.586L8 9l-.001 9.586a2 2 0 0 0 2.002 2.002h10.001a2 2 0 0 0 2-2V11a2 2 0 0 0-2-2h-2.587a2.001 2.001 0 0 0-1.414.586L13.586 12l3.415-3.415A2.001 2.001 0 0 0 17 7Z" />
                </svg>
              </span>
              <span className="ml-2 font-bold text-xl">CryptoAI</span>
            </div>
            <button
              type="button"
              className="text-gray-400 hover:text-white md:hidden"
              onClick={() => setOpen(false)}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          {/* Navigation Links */}
          <nav className="mt-8 flex-1 px-2 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) => `
                  group flex items-center px-4 py-3 text-sm font-medium rounded-lg
                  ${isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'}
                `}
                onClick={() => setOpen(false)}
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.name}
              </NavLink>
            ))}
          </nav>
          
          {/* Sidebar footer */}
          <div className="px-4 py-4 border-t border-gray-700 mt-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <img 
                  src="https://img.icons8.com/external-vitaliy-gorbachev-flat-vitaly-gorbachev/58/000000/external-robot-support-vitaliy-gorbachev-flat-vitaly-gorbachev.png" 
                  alt="AI Assistant" 
                  className="h-8 w-8 rounded-full bg-gray-700 p-1"
                />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">AI Assistant</p>
                <p className="text-xs text-gray-400">Ready to help</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;