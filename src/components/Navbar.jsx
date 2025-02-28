import { Link, useNavigate } from 'react-router-dom'

const Navbar = ({ role }) => {
  const navigate = useNavigate()
  
  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    navigate('/login')
  }

  return (
    <nav className="bg-gray-800 p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex space-x-4">
          <Link to={role === 'admin' ? "/home-admin" : "/home-user"} className="text-white px-3 py-2 rounded-md text-sm font-medium">
            Главная
          </Link>

          <Link to={role === 'admin' ? "/admin-publications" : "/publications"} className="text-white px-3 py-2 rounded-md text-sm font-medium">
            Публикации
          </Link>
          
          {role === 'admin' && (
            <Link to="/admin-users" className="text-white px-3 py-2 rounded-md text-sm font-medium">
              Все сотрудники
            </Link>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <Link to="/dashboard" className="text-white text-sm font-medium">
            Профиль
          </Link>
          <button 
            onClick={handleLogout} 
            className="text-white bg-red-500 hover:bg-red-600 px-3 py-2 rounded-md text-sm font-medium"
          >
            Выйти
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
