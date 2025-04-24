import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { makeAuthenticatedRequest } from '../services/api'
import { predictionService } from '../services/predictionService'
import Navbar from '../components/Navbar'
import Pagination from '../components/Pagination/Pagination'

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
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8
  const url = import.meta.env.VITE_API_URL
  const [publicationPrediction, setPublicationPrediction] = useState(null)
  const [publicationTrend, setPublicationTrend] = useState(null)

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
        
        if (response.status===200) {
          const data = await response.data
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
          `${url}/api/user/getPublications`,
          { method: 'GET', headers: { Authorization: `Bearer ${token}` }, params: {iin} },
          navigate
        )

        if (response.status===200) {
          const data = await response.data
          setPublications(data)
          
          // Анализируем публикации сразу после их получения
          if (data.length > 0) {
            const prediction = predictionService.predictNextYearPublications(data)
            const trend = predictionService.analyzePublicationTrend(data)
            setPublicationPrediction(prediction)
            setPublicationTrend(trend)
          }
        }
      } catch (error) {
        console.error('Error fetching publications:', error)
      }
    }

    fetchUserProfile()
    fetchUserPublications()
  }, [navigate, iin])

  const paginatedPublications = publications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(publications.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'growing':
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case 'declining':
        return (
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
          </svg>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-lg text-gray-600">Пользователь не найден</p>
      </div>
    )
  }

  return (
    <>
      <Navbar role="admin" />
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          {/* User Profile Card */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
              <h1 className="text-2xl font-bold text-white">Профиль пользователя</h1>
            </div>
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Profile Photo */}
                <div className="flex flex-col items-center">
                  <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-lg">
                    <img
                      src={user.profilePhoto ? `${url}/public${user.profilePhoto}` : '/default-profile.png'}
              alt="User Avatar"
                      className="w-full h-full object-cover"
            />
          </div>
                  <span className={`mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
                  </span>
                </div>

                {/* User Details */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">ФИО</label>
                      <p className="text-gray-900">{user.fullName || 'Не указано'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-gray-900">{user.email || 'Не указано'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Телефон</label>
                      <p className="text-gray-900">{user.phone || 'Не указано'}</p>
          </div>
        </div>
        <div>
                    <label className="text-sm font-medium text-gray-500">Научные интересы</label>
                    <p className="text-gray-900 whitespace-pre-wrap">{user.researchArea || 'Не указано'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Publications Section */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-gray-500 to-gray-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white">Публикации</h2>
            </div>
            <div className="p-6">
              {/* Publication Stats and Predictions */}
              {publications.length > 0 && (
                <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Prediction Card */}
                  <div className="bg-white border border-blue-100 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-blue-50 px-4 py-2 border-b border-blue-100">
                      <h3 className="text-sm font-medium text-blue-900">Прогноз на следующий год</h3>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-3xl font-bold text-blue-700">{publicationPrediction || 0}</p>
                          <p className="text-sm text-blue-600">ожидаемых публикаций</p>
                          <p className="text-xs text-gray-500 mt-1">
                            основано на динамике за последние годы
                          </p>
                        </div>
                        <svg className="w-12 h-12 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Trend Card */}
                  <div className="bg-white border border-green-100 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-green-50 px-4 py-2 border-b border-green-100">
                      <h3 className="text-sm font-medium text-green-900">Динамика публикаций</h3>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {getTrendIcon(publicationTrend?.trend)}
                            <span className="font-semibold text-gray-900">
                              {publicationTrend?.trend === 'growing' ? 'Рост' :
                               publicationTrend?.trend === 'declining' ? 'Снижение' : 'Стабильно'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {Math.abs(publicationTrend?.growth || 0).toFixed(1)} публикаций в год
                          </p>
                        </div>
                        <svg className="w-12 h-12 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {paginatedPublications.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {paginatedPublications.map((publication, index) => (
                    <div key={index} className="flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                      <div className="p-4 flex-1">
                        <div className="mb-3 pb-2 border-b border-gray-200">
                          <span className="inline-block px-2 py-1 text-xs font-medium text-white bg-blue-500 rounded-full mb-2">
                            {publicationTypeMap[publication.publicationType]}
                          </span>
                          <h3 className="text-base font-semibold text-gray-800 mb-1 line-clamp-2 text-left">
                            {publication.title}
                          </h3>
                          <p className="text-sm text-gray-600 text-left">
                            Год: {publication.year}
                          </p>
                        </div>
                        
                        <div className="text-sm text-gray-700">
                          <p className="mb-2 line-clamp-2 flex" title={`Авторы: ${publication.authors}`}>
                            <span className="font-medium text-gray-800 min-w-[80px]">Авторы:</span>
                            <span>{publication.authors}</span>
                          </p>
                          <p className="mb-2 line-clamp-2 flex" title={`Выходные данные: ${publication.output}`}>
                            <span className="font-medium text-gray-800 min-w-[80px]">Данные:</span>
                            <span>{publication.output}</span>
                          </p>
                          {publication.doi && (
                            <p className="mb-2 line-clamp-1 flex" title={`DOI: ${publication.doi}`}>
                              <span className="font-medium text-gray-800 min-w-[80px]">DOI:</span>
                              <span>{publication.doi}</span>
                            </p>
                          )}
                          {publication.isbn && (
                            <p className="mb-2 line-clamp-1 flex" title={`ISBN: ${publication.isbn}`}>
                              <span className="font-medium text-gray-800 min-w-[80px]">ISBN:</span>
                              <span>{publication.isbn}</span>
                            </p>
                          )}
                          {publication.file && (
                            <p className="mb-2 flex items-center">
                              <span className="font-medium text-gray-800 min-w-[80px]">Файл:</span>
                              <a
                                href={`${url}/${publication.file}`}
                                download
                                className="text-blue-500 hover:text-blue-600 hover:underline flex items-center"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Скачать файл
                              </a>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">У пользователя пока нет публикаций</p>
                </div>
              )}
            </div>
          </div>

          {publications.length > itemsPerPage && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </>
  )
}
