import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import { makeAuthenticatedRequest } from '../../services/api'
import { generateUserReport } from '../../services/reportUtils'
import { getUserIIN } from '../../services/userUtils'
import Navbar from '../../components/Navbar'
import ErrorMessage from '../../components/ErrorMessage'
import ADD from './BREAD/ADD'
import EDIT from './BREAD/EDIT'
import PublicationComponents from '../../components/FilterComponents/PublicationComponents'


export const publicationTypeMap = {
  scopus_wos: 'Научные труды (Scopus/Web of Science)',
  koknvo: 'КОКНВО',
  conference: 'Материалы конференций',
  articles: 'Статьи РК и не включенные в Scopus/WoS',
  books: 'Монографии, книги и учебные материалы',
  patents: 'Патенты, авторское свидетельство',
}

export default function PublicationsPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [publications, setPublications] = useState([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [type, setType] = useState(null);
  const [year, setYear] = useState(null);
  const [school, setSchool] = useState(null);
  const [errorMessage, setErrorMessage] = useState("")

  const url = import.meta.env.VITE_API_URL

  useEffect(() => {
    try {
      const iin = getUserIIN()
      console.log('IIN пользователя:', iin)
  
      localStorage.setItem('iin', iin)
  
      const token = localStorage.getItem('accessToken')

      if (!token) {
        console.warn("Токен отсутствует, редирект на /login")
        navigate('/login')
        return
      } else
      {
        console.log('token')
      }

      const decodedToken = jwtDecode(token)
      // setIsAdmin(decodedToken.role === 'admin')

      const isAdmin = decodedToken.role === 'admin' ? true : false;
      console.log("isAdmin:", isAdmin)
  
      setIsAdmin(isAdmin)

    } catch (error) {
      console.error('Ошибка при получении IIN:', error.message)
      setErrorMessage("Вы не авторизованы. Пожалуйста, войдите в систему.")
      navigate('/login')
    }
  }, [navigate])
  const fetchPublications = useCallback(async () => {
    const token = localStorage.getItem('accessToken')
      if (!token) return
  
      const iin = localStorage.getItem('iin')
  
      try {
        const response = await makeAuthenticatedRequest(
          `${url}/api/user/getPublications`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
              params: {iin, publicationType: type, school , year }

          },
          navigate
        )
        console.log("Ответ от сервера:", response)


        if (response.status === 200) {  
          console.log("Публикации успешно загружены!")
          setPublications(response.data)  // Здесь данные из Axios
        } else {
          console.warn("Не удалось загрузить публикации, редирект...")
          setErrorMessage("Не удалось загрузить публикации.")
          navigate('/login')
        }
      } catch (error) {
        console.error('Ошибка при загрузке публикаций:', error)
        setErrorMessage("Произошла ошибка при загрузке публикаций.")
      } finally {
        setIsLoading(false)
      }
  }, [navigate, school, type, url, year])

  useEffect(() => {
    if (isAdmin === null) return;
      fetchPublications()
  }, [isAdmin, fetchPublications])



  const handleGenerateUserReport = () => {
    try {
      const iin = getUserIIN()
      generateUserReport(url, navigate, iin)
    } catch (error) {
      console.error('Ошибка при генерации отчета:', error.message)
      setErrorMessage("Произошла ошибка при генерации отчета.")
    }
  }

  

  const handleDeletePublication= async (id) => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        alert('Ошибка авторизации. Пожалуйста, войдите снова.')
        return
      }
      
      const response = await makeAuthenticatedRequest(`${url}/api/admin/publications/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }, navigate)

      if (response.status!==200) {
        const errorText = await response.text()
        throw new Error(`Ошибка при delete: ${errorText}`)
      }
      fetchPublications()
      alert('Публикация успешно DELETED!')
      navigate('/publications')
    } catch (error) {
      console.error('Ошибка при delete изменений:', error)
      alert('Произошла ошибка. Попробуйте позже.')
    }
  }

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
      <div className="w-full mx-auto min-h-screen bg-gray-100 p-8">
        <ErrorMessage message={errorMessage} />

        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Публикации</h1>
          {!isAdmin && (
            <div className="flex justify-between items-center mb-4">
              <ADD updateData={fetchPublications}/>
              <button
                onClick={handleGenerateUserReport}
                className="mt-2 mb-2 py-2 px-4 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none"
              >
                Генерировать отчет
              </button>
            </div>
          )}
        </div>
       <PublicationComponents setYear={setYear} setSchool={setSchool} setType={setType} school={school} type={type}/>

        <div>
          {publications.length > 0 ? (
            publications.map((publication, index) => (
              <div key={index} className="mb-4 p-4 border border-gray-300 rounded-lg bg-white">
                <p><strong>Тип публикации:</strong> {publicationTypeMap[publication.publicationType]}</p>
                <p><strong>Авторы:</strong> {publication.authors}</p>
                <p><strong>Название статьи:</strong> {publication.title}</p>
                <p><strong>Год:</strong> {publication.year}</p>
                <p><strong>Выходные данные:</strong> {publication.output}</p>
                {publication.doi && <p><strong>Ссылки, DOI:</strong> {publication.doi}</p>}
                {publication.isbn && <p><strong>ISBN:</strong> {publication.isbn}</p>}
                {publication.file && (
                  <p>
                    <strong>Файл:</strong> <a href={`${url}/${publication.file}`} download className="text-blue-600 hover:underline">Скачать файл</a>
                  </p>
                )}
                <div>
                  <EDIT pub={publication} updateData={fetchPublications}/>
                  {/* <button
                    onClick={handleEditPublication}
                    className="mt-3 py-1 px-3 text-white bg-green-600 rounded-lg hover:bg-green-700"
                  >
                    Редактировать
                  </button> */}
                  <button
                    onClick={() => handleDeletePublication(publication._id)}
                    className="py-1 px-3 text-white bg-red-600 rounded-lg hover:bg-red-700"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-600">У вас пока нет публикаций.</p>
          )}
        </div>

      </div>
    </>
  )
}
