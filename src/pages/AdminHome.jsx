import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import Navbar from '../components/Navbar'

const publicationTypeMap = {
  scopus_wos: 'Научные труды (Scopus/Web of Science)',
  koknvo: 'КОКНВО',
  conference: 'Материалы конференций',
  articles: 'Статьи РК и не включенные в Scopus/WoS',
  books: 'Монографии, книги и учебные материалы',
  patents: 'Патенты, авторское свидетельство',
}

export default function AdminHome() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [statistics, setStatistics] = useState(null)
  const url = process.env.REACT_APP_API_URL

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken')
        if (!accessToken) {
          navigate('/login')
          return
        }

        const decodedToken = jwtDecode(accessToken)
        if (decodedToken.role !== 'admin') {
          navigate('/home-user')
          return
        }

        // Fetch statistics from the backend
        const response = await fetch(`${url}/api/admin/statistics`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch statistics')
        }

        const data = await response.json()
        setStatistics(data)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching statistics:', error)
        navigate('/login')
      }
    }

    fetchStatistics()
  }, [navigate])

  if (isLoading) {
    return <p>Загрузка...</p>
  }

  return (
    <div>
      <Navbar role="admin" />
      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-2xl font-bold">Добро пожаловать!</h1>
        <p className="mt-4">Ваша роль в системе - администратор.</p>
        <p>Вы можете управлять всеми публикациями, резюме и просматривать информацию обо всех сотрудниках.</p>

        {statistics && (
          <div className="mt-8">
            <h2 className="text-xl font-bold">Статистика</h2>
            <p><strong>Всего публикаций:</strong> {statistics.totalPublications}</p>
            <p><strong>Всего пользователей:</strong> {statistics.totalUsers}</p>

            <h3 className="text-lg font-semibold mt-4">Публикации по высшим школам:</h3>
            <ul>
              {Object.entries(statistics.schools).map(([school, count]) => (
                <li key={school}>{school}: {count}</li>
              ))}
            </ul>

            <h3 className="text-lg font-semibold mt-4">Типы публикаций:</h3>
            <ul>
              {Object.entries(statistics.publicationTypes).map(([type, count]) => (
                <li key={type}>
                  {publicationTypeMap[type] ? publicationTypeMap[type] : 'Неизвестный тип публикации'}: {count}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
