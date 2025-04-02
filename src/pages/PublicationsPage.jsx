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

export default function Publications() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [publications, setPublications] = useState([])
  const [isAdding, setIsAdding] = useState(false)
  // const [isEditing, setIsEditing] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedType, setSelectedType] = useState("")
  // const [editingPublicationId, setEditingPublicationId] = useState(null)
  const [newPublication, setNewPublication] = useState({
    authors: '',
    title: '',
    year: '',
    output: '',
    doi: '',
    isbn: '',
    scopus: false,
    wos: false,
    file: null,
    publicationType: '',
  })

  // const [publicationData, setPublicationData] = useState({
  //   authors: '',
  //   title: '',
  //   year: '',
  //   output: '',
  //   doi: '',
  //   isbn: '',
  //   scopus: false,
  //   wos: false,
  //   file: null,
  //   publicationType: '',
  // })

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
  
  useEffect(() => {
    if (isAdmin === null) return;

    const fetchPublications = async () => {
      const token = localStorage.getItem('accessToken')
      if (!token) return
  
      const iin = localStorage.getItem('iin')
      const endpoint = isAdmin
        ? `${url}/api/admin/publications`
        : `${url}/api/user/getPublications?iin=${iin}`
  
      try {
        const response = await makeAuthenticatedRequest(
          endpoint,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          },
          navigate
        )
        console.log("Ответ от сервера:", response)

        // if (response.status === 200) {
        //   const data = await response.json()
        //   if (Array.isArray(data)) {
        //     setPublications(response.data)
        //   } else {
        //     console.error('Ошибка: данные публикаций не являются массивом', data)
        //     setErrorMessage("Ошибка загрузки данных. Попробуйте позже.")
        //     setPublications([]) // Устанавливаем пустой массив
        //   }
        // } else {
        //   console.error('Ошибка при загрузке публикаций')
        //   setErrorMessage("Не удалось загрузить публикации. Проверьте авторизацию.")
        //   if (navigate) {
        //     navigate('/login');
        //   }
        // }

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
    }
  
      fetchPublications()
  }, [isAdmin, navigate])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setNewPublication((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

const handleFileChange = (e) => {
    const file = e.target.files[0]
    
    if (file && file.size > 5 * 1024 * 1024) {
        setErrorMessage('Файл не должен превышать 5MB.')
        e.target.value = ''
        return
    }

    if (file && !file.name.toLowerCase().endsWith('.pdf')) {
        setErrorMessage('Допустим только формат PDF.')
        e.target.value = ''
        return
    }

    setNewPublication((prev) => ({
        ...prev,
        file,
    }))
}

  const handleAddPublication = async () => {
    const requiredFields = ['authors', 'title', 'year', 'output', 'publicationType']
    const missingFields = requiredFields.filter((field) => !newPublication[field])

    // Проверка обязательных полей
    if (missingFields.length > 0) {
        setErrorMessage(`Пожалуйста, заполните все обязательные поля: ${missingFields.join(', ')}`)
        return
    }

    // Дополнительная валидация значений
    if (newPublication.year && !/^\d{4}$/.test(newPublication.year)) {
        setErrorMessage('Год должен быть в формате YYYY.')
        return
    }

    if (
        newPublication.publicationType &&
        !['scopus_wos', 'koknvo', 'conference', 'articles', 'books', 'patents'].includes(
            newPublication.publicationType
        )
    ) {
        setErrorMessage('Тип публикации имеет недопустимое значение.')
        return
    }

    const token = localStorage.getItem('accessToken')
    if (!token) {
      setErrorMessage("Ошибка авторизации. Пожалуйста, войдите снова.");
      navigate('/login'); // Перенаправляем на страницу входа
      return;
  }

    // const decodedToken = jwtDecode(token)

    const formData = new FormData()

    // const authorsArray = newPublication.authors.split(',').map((author) => author.trim())
    // formData.append('authors', JSON.stringify(authorsArray))
    // const authorsArray = newPublication.authors
    // .split(',')
    // .map((author) => author.trim())
    // .filter((author) => author.length > 0)

    const authorsString = newPublication.authors
    .split(',')
    .map((author) => author.trim())
    .join(', ');

    const updatedPublication = {
      ...newPublication,
      authors: authorsString, // заменяем строку на массив
    }

    Object.keys(updatedPublication).forEach((key) => {
      if (key === 'file' && updatedPublication.file) {
        formData.append(key, updatedPublication.file)
      } else if (key === 'authors') {
        // Преобразуем массив authors в строку для отправки
        formData.append(key, updatedPublication.authors)
        // formData.append(key, JSON.stringify(updatedPublication.authors))
      } else {
        formData.append(key, updatedPublication[key])
      }
    })

    formData.forEach((value, key) => {
      console.log(`${key}: ${value}`)
    })

    try {
        const response = await makeAuthenticatedRequest(`${url}/api/user/upload`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        }, navigate)
        
        // console.log('Данные перед отправкой:', newPublication)

        if (response.ok) {
            const addedPublication = await response.json()
            console.log('Добавленная публикация:', addedPublication)

            // Проверяем, что предыдущее состояние — массив
            setPublications((prev) => {
                if (Array.isArray(prev)) {
                    return [...prev, addedPublication]
                } else {
                    console.error('Ошибка: состояние публикаций не является массивом', prev)
                    return [addedPublication]
                }
            })

            setNewPublication({
                authors: '',
                title: '',
                year: '',
                output: '',
                doi: '',
                isbn: '',
                scopus: false,
                wos: false,
                file: null,
                publicationType: '',
            })
            setSelectedType('')
            setCurrentStep(1)
            setIsAdding(false)
        } else {
            // console.error('Ошибка при добавлении публикации')
            const errorData = await response.json()
            setErrorMessage(`Ошибка: ${errorData.message}`)
        }
    } catch (error) {

        setErrorMessage("Произошла ошибка при добавлении публикации. Попробуйте снова.")

    }
}

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    navigate('/login')
  }

  const handleNextStep = () => {
    if (selectedType) {
      setNewPublication((prev) => ({ ...prev, publicationType: selectedType }))
      setCurrentStep(2)
    } else {
      alert('Пожалуйста, выберите тип публикации')
    }
  }

  // const handleEditNextStep = () => {
  //   if (selectedType) {
  //     setPublicationData((prev) => ({
  //       ...prev,
  //       publicationType: selectedType,
  //     }))
  //     setCurrentStep(2)
  //   } else {
  //     alert("Пожалуйста, выберите тип публикации")
  //   }
  // }

  const handlePreviousStep = () => {
    setCurrentStep(1)
  }

  const handleGenerateUserReport = () => {
    try {
      const iin = getUserIIN()
      generateUserReport(url, router, iin)
    } catch (error) {
      console.error('Ошибка при генерации отчета:', error.message)
      setErrorMessage("Произошла ошибка при генерации отчета.")
    }
  }

  // const handleEditedInputChange = (e) => {
  //   const { name, value, type, checked } = e.target
  //   setPublicationData((prev) => ({
  //     ...prev,
  //     [name]: type === 'checkbox' ? checked : value,
  //   }))
  // }


  // const handleEditPublication = (publication) => {
  //   setIsEditing(true)
  //   setEditingPublicationId(publication._id)
  //   setSelectedType(publication.publicationType)
  //   setPublicationData({ ...publication })
  //   setCurrentStep(1)
  // }

  // const handleSave = async () => {
  //   try {
  //     const token = localStorage.getItem('accessToken')
  //     if (!token) {
  //       alert('Ошибка авторизации. Пожалуйста, войдите снова.')
  //       return
  //     }
  //     const id = localStorage.getItem('editingPublicationId') // Извлекаем ID из localStorage
  //     if (!id) {
  //       alert('ID публикации не найден.')
  //       return
  //     }
      
  //     const response = await makeAuthenticatedRequest(`${url}/api/user/editPublication/${editingPublicationId}`, {
  //       method: 'PUT',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify(publicationData),
  //     }, router)

  //     if (!response.ok) {
  //       const errorText = await response.text()
  //       throw new Error(`Ошибка при сохранении изменений: ${errorText}`)
  //     }

  //     alert('Публикация успешно обновлена!')
  //     navigate('/publications')
  //   } catch (error) {
  //     console.error('Ошибка при сохранении изменений:', error)
  //     alert('Произошла ошибка. Попробуйте позже.')
  //   }
  // }

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
              <button
                onClick={() => setIsAdding(true)}
                className="py-2 px-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Добавить публикацию
              </button>
              <button
                onClick={handleGenerateUserReport}
                className="mt-2 mb-2 py-2 px-4 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none"
              >
                Генерировать отчет
              </button>
            </div>
          )}
        </div>
       
        {isAdding && (
          <div className="mb-6 bg-gray-50 p-4 rounded-lg shadow-inner">
            {currentStep === 1 ? (
              <>
                <h2 className="text-xl font-bold mb-4">Выберите тип публикации</h2>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Выберите тип публикации</option>
                  <option value="scopus_wos">Публикации Scopus и Web of Science</option>
                  <option value="koknvo">Научные статьи в журналах КОКНВО</option>
                  <option value="conference">Публикации в материалах конференций</option>
                  <option value="articles">Научные статьи в периодических изданиях</option>
                  <option value="books">Монографии, учебные пособия и другие книги</option>
                  <option value="patents">Патенты, авторские свидетельства и другие охранные документы</option>
                </select>
                <button
                  onClick={handleNextStep}
                  className="py-2 px-4 text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Следующий
                </button>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-4">Новая публикация</h2>
                {['authors', 'title', 'year'].map((field) => (
                  <div key={field} className="mb-4">
                    <label className="block mb-1 font-medium text-gray-700">
                      {field === 'authors' && 'Авторы'}
                      {field === 'title' && 'Название'}
                      {field === 'year' && 'Год'}
                    </label>
                    <input
                      type="text"
                      name={field}
                      value={newPublication[field]}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}

                <div className="mb-4">
                  <label className="block mb-1 font-medium text-gray-700">Выходные данные</label>
                  <textarea
                    name="output"
                    value={newPublication.output}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>

                {selectedType === 'scopus_wos' && (
                  <>
                    <label className="block mb-1 font-medium text-gray-700">Ссылки, DOI</label>
                    <input
                      type="text"
                      name="doi"
                      value={newPublication.doi}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <label className="block mb-1 font-medium text-gray-700">Scopus</label>
                    <input
                      type="checkbox"
                      name="scopus"
                      checked={newPublication.scopus}
                      onChange={handleInputChange}
                    />
                    <label className="block mb-1 font-medium text-gray-700">WoS</label>
                    <input
                      type="checkbox"
                      name="wos"
                      checked={newPublication.wos}
                      onChange={handleInputChange}
                    />
                  </>
                )}
                {selectedType === 'koknvo' && (
                  <>
                    <label className="block mb-1 font-medium text-gray-700">Ссылки, DOI</label>
                    <input
                      type="text"
                      name="doi"
                      value={newPublication.doi}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </>
                )}
                {selectedType === 'books' && (
                  <>
                    <label className="block mb-1 font-medium text-gray-700">ISBN</label>
                    <input
                      type="text"
                      name="isbn"
                      value={newPublication.isbn}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </>
                )}

                <label className="block mb-1 font-medium text-gray-700">Загрузить файл (PDF)</label>
                <input type="file" onChange={handleFileChange} accept=".pdf" className="mb-4" />

                <div className="flex justify-between">
                  <button
                    onClick={handlePreviousStep}
                    className="py-2 px-4 text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    Назад
                  </button>
                  <button
                    onClick={handleAddPublication}
                    className="py-2 px-4 text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    Сохранить публикацию
                  </button>
                </div>
              </>
            )}
          </div>
        )}

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
                  {/* <button
                    onClick={handleEditPublication}
                    className="mt-3 py-1 px-3 text-white bg-green-600 rounded-lg hover:bg-green-700"
                  >
                    Редактировать
                  </button> */}
                  {/* <button
                    onClick={() => handleDeletePublication(publication.id)}
                    className="py-1 px-3 text-white bg-red-600 rounded-lg hover:bg-red-700"
                  >
                    Удалить
                  </button> */}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-600">У вас пока нет публикаций.</p>
          )}
        </div>

          {/* <div className="min-h-screen bg-gray-100 p-8">
          <h1 className="text-2xl font-bold mb-4">Редактировать публикацию</h1>
          {isEditing ? (
            <div className="mb-6 bg-gray-50 p-4 rounded-lg shadow-inner">
              {currentStep === 1 ? (
                <>
                  <h2 className="text-xl font-bold mb-4">Выберите тип публикации</h2>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Выберите тип публикации</option>
                    {Object.entries(publicationTypeMap).map(([key, value]) => (
                      <option key={key} value={key}>
                        {value}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleEditNextStep}
                    className="py-2 px-4 text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none"
                  >
                    Следующий
                  </button>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold mb-4">Детали публикации</h2>
                  {Object.keys(publicationData).map((field) => (
                    <div key={field} className="mb-4">
                      <label className="block mb-1 font-medium text-gray-700">
                        {field}
                      </label>
                      <input
                        type="text"
                        name={field}
                        value={publicationData[field]}
                        onChange={handleEditedInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                  <button
                    onClick={handleSave}
                    className="mt-6 py-2 px-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none"
                  >
                    Сохранить изменения
                  </button>
                </>
              )}
            </div>
          ) : (
            publications.map((publication) => (
              <div key={publication._id}>
                <h3>{publication.title}</h3>
                <button
                  onClick={() => handleEditPublication(publication)}
                  className="mt-3 py-1 px-3 text-white bg-green-600 rounded-lg hover:bg-green-700"
                >
                  Редактировать
                </button>
              </div>
            ))
          )}
        </div> */}
      </div>
    </>
  )
}
