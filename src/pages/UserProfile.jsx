import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { makeAuthenticatedRequest } from '../services/api'
import Navbar from '../components/Navbar'

const publicationTypeMap = {
  scopus_wos: 'Научные труды (Scopus/Web of Science)',
  koknvo: 'КОКНВО',
  conference: 'Материалы конференций',
  articles: 'Статьи РК и не включенные в Scopus/WoS',
  books: 'Монографии, книги и учебные материалы',
  patents: 'Патенты, авторское свидетельство',
}

export default function UserProfile() {
  const navigate = useNavigate()
  const { iin } = useParams()
  const [user, setUser] = useState(null)
  const [publications, setPublications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')
  const url = import.meta.env.VITE_API_URL

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      navigate('/login')
      return
    }

    const fetchUserProfile = async () => {
      try {
        const response = await makeAuthenticatedRequest(
          `${url}/api/admin/user/${iin}`,
          { method: 'GET', headers: { Authorization: `Bearer ${token}` } },
          navigate
        )
        
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          navigate('/admin-users')
        }
      } catch (error) {
        navigate('/admin-users')
      } finally {
        setIsLoading(false)
      }
    }

    const fetchUserPublications = async () => {
      try {
        const response = await makeAuthenticatedRequest(
          `${url}/api/user/${iin}/getPublications`,
          { method: 'GET', headers: { Authorization: `Bearer ${token}` } },
          navigate
        )

        if (response.ok) {
          const data = await response.json()
          setPublications(data.publications)
        }
      } catch (error) {}
    }

    fetchUserProfile()
    fetchUserPublications()
  }, [navigate, iin])

  if (isLoading) {
    return <p>Загрузка...</p>
  }

  if (!user) {
    return <p>Пользователь не найден</p>
  }

  return (
    <>
      <Navbar role="admin" />
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-4">Профиль пользователя</h1>
          <div className="flex justify-center mb-6">
            <img
              src={`${url}/public${user.profilePhoto || '/default-profile.png'}`}
              alt="User Avatar"
              className="w-36 h-36 rounded-full object-cover"
            />
          </div>
          <div className="mb-4">
            <p><strong>ФИО:</strong> {user.fullName}</p>
            <p><strong>Роль:</strong> {user.role}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Телефон:</strong> {user.phone}</p>
            <p><strong>Научные интересы:</strong> {user.researchArea}</p>
          </div>
        </div>
      </div>
    </>
  )
}
