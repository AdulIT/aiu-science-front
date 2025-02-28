import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { makeAuthenticatedRequest } from '../services/api';
import { generateReport, generateUserReport } from '../services/reportUtils';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const publicationTypeMap = {
    scopus_wos: 'Научные труды (Scopus/Web of Science)',
    koknvo: 'КОКНВО',
    conference: 'Материалы конференций',
    articles: 'Статьи РК и не включенные в Scopus/WoS',
    books: 'Монографии, книги и учебные материалы',
    patents: 'Патенты, авторское свидетельство',
};

const allHigherSchools = [
  "Высшая школа информационных технологий и инженерии",
  "Высшая школа экономики",
  "Высшая школа права",
  "Педагогический институт",
  "Высшая школа искусств и гуманитарных наук",
  "Высшая школа естественных наук"
];

export default function AdminPublications() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [publications, setPublications] = useState([]);
  const url = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          navigate('/login');
          return;
        }

        const decodedToken = jwtDecode(token);
        if (decodedToken.role !== 'admin') {
          navigate('/home-user');
          return;
        }

        const response = await makeAuthenticatedRequest(
          `${url}/api/admin/publications`,
          { method: 'GET', headers: { Authorization: `Bearer ${token}` } },
          navigate
        );

        if (response.ok) {
          const data = await response.json();
          setPublications(data);
        } else {
          alert('Не удалось загрузить публикации');
        }
      } catch (error) {
        alert('Произошла ошибка при загрузке публикаций');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-lg font-bold">Загрузка...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar role="admin" />
      <div className="min-h-screen bg-gray-100 p-8">
        <h1 className="text-2xl font-bold">Публикации всех сотрудников</h1>
        <button onClick={() => generateReport(url, navigate)}
          className="mt-2 py-2 px-4 text-white bg-blue-600 rounded-md hover:bg-blue-700">
          Генерировать отчет
        </button>
      </div>
    </>
  );
}
