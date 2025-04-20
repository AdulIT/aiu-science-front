import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import Navbar from '../components/Navbar'
import PublicationStats from '../components/PublicationStats/PublicationStats'
import BarChart from '../components/PublicationStats/BarChart'

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
  const url = import.meta.env.VITE_API_URL

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
    <div className="min-h-screen bg-gray-100">
      <Navbar role="admin" />
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Добро пожаловать!</h1>
          <p className="text-lg text-gray-600">Ваша роль в системе - <span className="font-semibold text-indigo-600">администратор</span>.</p>
          <p className="text-gray-500 mt-2">Вы можете управлять всеми публикациями, резюме и просматривать информацию обо всех сотрудниках.</p>
        </div>

        {/* Statistics Section */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* General Stats Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-700 mb-4">Общая статистика</h2>
              <p className="text-gray-600 mb-2"><span className="font-semibold">Всего публикаций:</span> {statistics.totalPublications}</p>
              <p className="text-gray-600"><span className="font-semibold">Всего пользователей:</span> {statistics.totalUsers}</p>
            </div>

            {/* Schools Stats Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold text-gray-700 mb-4">Публикации по высшим школам</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                {Object.entries(statistics.schools).map(([school, count]) => (
                  <li key={school}><span className="font-semibold">{school}:</span> {count}</li>
                ))}
              </ul>
            </div>

            {/* Publication Types Stats Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold text-gray-700 mb-4">Типы публикаций</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                {Object.entries(statistics.publicationTypes).map(([type, count]) => (
                  <li key={type}>
                    <span className="font-semibold">{publicationTypeMap[type] ? publicationTypeMap[type] : 'Неизвестный тип'}:</span> {count}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-6">
          {/* Schools Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-700 mb-4">Статистика по школам</h2>
            <div className="w-full max-w-4xl mx-auto">
              {statistics?.schools && 
                <BarChart 
                  labels={Object.keys(statistics.schools).map(school => 
                    school === "Высшая школа информационных технологий и инженерии" ? "ВШИТиИ" :
                    school === "Школа права" ? "ШП" : school
                  )} 
                  series={Object.keys(statistics.schools).map(k => statistics.schools[k])}
                  height={300}
                  width="100%"
                />
              }
            </div>
          </div>

          {/* Publication Types Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-700 mb-4">Статистика публикаций</h2>
            <div className="w-full">
              <PublicationStats />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
