import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import { makeAuthenticatedRequest } from '../services/api'
import { generateUserReport } from '../services/reportUtils'
import { getUserIIN } from '../services/userUtils'
import Navbar from '../components/Navbar'
import ErrorMessage from '../components/ErrorMessage'

const publicationTypeMap = {
  scopus_wos: 'Научные труды (Scopus/Web of Science)',
  koknvo: 'КОКНВО',
  conference: 'Материалы конференций',
  articles: 'Статьи РК и не включенные в Scopus/WoS',
  books: 'Монографии, книги и учебные материалы',
  patents: 'Патенты, авторское свидетельство',
}

const PublicationsPage = () => {
  const navigate = useNavigate()
  const [publications, setPublications] = useState([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const url = import.meta.env.VITE_API_URL

  useEffect(() => {
    try {
      const iin = getUserIIN()
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
      console.log(decodedToken)

      // setIsAdmin(decodedToken.role === 'admin')
    // Явно объявляем isAdmin перед setState
    const isAdmin = decodedToken.role === 'admin' ? true : false;
    console.log("isAdmin:", isAdmin)

    setIsAdmin(isAdmin)  // Устанавливаем состояние

    } catch (error) {
      console.log("Вы не авторизованы. Пожалуйста, войдите в систему.")
      
      setErrorMessage("Вы не авторизованы. Пожалуйста, войдите в систему.")
      navigate('/login')
    }
  }, [navigate])

  useEffect(() => {
    const fetchPublications = async () => {
      const token = localStorage.getItem('accessToken')
      if (!token) return
  
      const iin = localStorage.getItem('iin')
      const endpoint = isAdmin
        ? `${url}/api/admin/publications`
        : `${url}/api/user/getPublications?iin=${iin}`
  
      try {
        console.log("Токен перед отправкой запроса:", token);
        const response = await makeAuthenticatedRequest(endpoint, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        }, navigate)
  
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
        console.error("Ошибка при загрузке публикаций:", error);
        setErrorMessage("Произошла ошибка при загрузке публикаций.")
      }
    }
  
    fetchPublications()
  }, [isAdmin, navigate])

  return (
    <>
      <Navbar role={isAdmin ? 'admin' : 'user'} />
      <div className="w-full mx-auto min-h-screen bg-gray-100 p-8">
        <ErrorMessage message={errorMessage} />
        <h1 className="text-2xl font-bold mb-4">Публикации</h1>
        <div>
          {publications.length > 0 ? (
            publications.map((publication, index) => (
              <div key={index} className="mb-4 p-4 border border-gray-300 rounded-lg bg-white">
                <p><strong>Тип публикации:</strong> {publicationTypeMap[publication.publicationType]}</p>
                <p><strong>Авторы:</strong> {publication.authors}</p>
                <p><strong>Название статьи:</strong> {publication.title}</p>
                <p><strong>Год:</strong> {publication.year}</p>
                <p><strong>Выходные данные:</strong> {publication.output}</p>
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

export default PublicationsPage
