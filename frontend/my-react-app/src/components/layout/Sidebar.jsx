import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const menuItems = [
    { name: 'Home', path: '/', icon: '🏠' },
    { name: 'IT Fields', path: '/it-fields', icon: '🔍' },
    { name: 'Academic Guide', path: '/academic-guide', icon: '📚' },
    { name: 'IT Jobs', path: '/it-jobs', icon: '💼' },
    { name: 'Community', path: '/it-clubs', icon: '👥' },
  ];

  return (
    <aside className="hidden lg:block fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white/80 backdrop-blur-sm border-r border-gray-200 px-5 py-8 shadow-sm">
      <nav className="space-y-2 text-sm">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 font-semibold border border-blue-100'
                  : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 text-gray-600 hover:text-blue-600 hover:font-medium hover:border hover:border-gray-200'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  isActive 
                    ? 'bg-blue-500 scale-125' 
                    : 'bg-gray-300 group-hover:bg-blue-400 group-hover:scale-125'
                }`}></div>
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      
      {/* Sidebar Footer */}
      <div className="absolute bottom-8 left-5 right-5">
        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100 hover:shadow-md transition-shadow duration-300">
          <p className="text-xs text-gray-600">Need guidance?</p>
          <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors duration-300 inline-flex items-center gap-1">
            Chat with Mentor 
            <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
          </a>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;