import { Link } from 'react-router-dom';

const MobileMenu = ({ isOpen, onClose }) => {
  const menuItems = [
    { name: 'Home', path: '/', active: true },
    { name: 'IT Fields', path: '/it-fields', active: false },
    { name: 'Academic Guide', path: '/academic-guide', active: false },
    { name: 'IT Jobs', path: '/it-jobs', active: false },
    { name: 'Community', path: '/it-clubs', active: false },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <div 
        className="absolute inset-0 bg-black/20 transition-opacity duration-300" 
        onClick={onClose}
      ></div>
      <div className="absolute left-0 top-16 bottom-0 w-64 bg-white shadow-xl p-6 transform transition-transform duration-300 ease-in-out translate-x-0">
        <nav className="space-y-4 mt-4">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
                item.active 
                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 font-semibold border border-blue-100'
                  : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 text-gray-600 hover:text-blue-600 hover:font-medium hover:border hover:border-gray-200'
              } transition-all duration-300`}
            >
              <div className={`w-2 h-2 rounded-full ${
                item.active ? 'bg-blue-500' : 'bg-gray-300'
              }`}></div>
              {item.name}
            </Link>
          ))}
        </nav>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <Link 
            to="/register" 
            onClick={onClose}
            className="block w-full text-center px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium mb-3 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
          >
            Register
          </Link>
          <Link 
            to="/login" 
            onClick={onClose}
            className="block w-full text-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:border-blue-400 hover:text-blue-600 transition-all duration-300"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;