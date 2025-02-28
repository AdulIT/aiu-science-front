import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { makeAuthenticatedRequest } from '../services/api'
import Navbar from '../components/Navbar'
import { jwtDecode } from 'jwt-decode'

export default function Dashboard() {
  const navigate = useNavigate()
  const { iin } = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userData, setUserData] = useState({
    fullName: '',
    profilePhoto: '',
    scopusId: '',
    wosId: '',
    orcid: '',
    birthDate: '',
    phone: '',
    email: '',
    researchArea: '',
    higherSchool: '',
    role: '',
  })
  const url = process.env.REACT_APP_API_URL

  useEffect(() => {
    const token = localStorage.getItem('accessToken')

    if (!token) {
      navigate('/login')
      return
    }

    const fetchUserData = async () => {
      try {
        const decodedToken = jwtDecode(token)
        setIsAdmin(decodedToken.role === 'admin')

        const endpoint = isAdmin && iin
          ? `${url}/api/admin/user/${iin}`
          : `${url}/api/user/profile`

        const response = await makeAuthenticatedRequest(endpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }, navigate)

        if (response.ok) {
          const data = await response.json()
          setUserData(data)
        } else {
          navigate('/login')
        }
      } catch (error) {
        console.error('Ошибка при загрузке данных пользователя:', error)
        navigate('/login')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [navigate, isAdmin, iin])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-lg font-bold">Загрузка...</p>
      </div>
    )
  }

  return (
    <>
      <Navbar role={isAdmin ? 'admin' : 'user'} />
      <div className="max-w-7xl mx-auto min-h-screen bg-gray-100 p-8">
        <h1 className="text-2xl font-bold">Личный кабинет</h1>
        <p className="mt-4">Информация о пользователе.</p>
      </div>
    </>
  )
}
