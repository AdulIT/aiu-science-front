import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { makeAuthenticatedRequest } from "../services/api";
import { generateReport, generateUserReport } from "../services/reportUtils";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { publicationTypeMap } from "./PublicationPage/PublicationsPage";
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from "@headlessui/react";
import PublicationComponents from "../components/FilterComponents/PublicationComponents";

export const allHigherSchools = [
  "Высшая школа информационных технологий и инженерии",
  "Высшая школа экономики",
  "Высшая школа права",
  "Педагогический институт",
  "Высшая школа искусств и гуманитарных наук",
  "Высшая школа естественных наук",
];

export default function AdminPublications() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [type, setType] = useState(null);
  const [year, setYear] = useState(null);
  const [school, setSchool] = useState(null);
  const [name, setName] = useState(null);
  const [publications, setPublications] = useState([]);
  const url = import.meta.env.VITE_API_URL;
  
  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const decodedToken = jwtDecode(token);
      if (decodedToken.role !== "admin") {
        navigate("/home-user");
        return;
      }

      const response = await makeAuthenticatedRequest(
        `${url}/api/admin/publications`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
          params: { publicationType: type, school , year, name},
        },
        navigate
      );

      if (response.status === 200) {
        console.log("Публикации успешно загружены!");
        console.log(response);
        setPublications(response.data);
      } else {
        alert("Не удалось загрузить публикации");
      }
    } catch (error) {
      alert("Произошла ошибка при загрузке публикаций");
    } finally {
      setIsLoading(false);
    }
  }, [navigate, type, url, school, year, name]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData, navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-lg font-bold text-gray-700">Загрузка...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar role="admin" />
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Публикации всех сотрудников</h1>
          <button
            onClick={() => generateReport(url, navigate)}
            className="w-full sm:w-auto py-2 px-4 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
          >
            Генерировать отчет
          </button>
        </div>

        <PublicationComponents setYear={setYear} setName={setName} setSchool={setSchool} setType={setType} school={school} type={type}/>
        
        <div className="mt-6">
          {publications.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {publications.map((publication) => (
                <div key={publication._id} className="flex flex-col justify-between border border-gray-300 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden min-h-[300px]">
                  <div className="p-4">
                    <div className="mb-3 pb-2 border-b border-gray-300">
                      <span className="inline-block px-2 py-1 text-xs font-medium text-white bg-indigo-500 rounded-full mb-1">
                        {publicationTypeMap[publication.publicationType]}
                      </span>
                      <h3 className="text-base font-semibold line-clamp-2 mb-1 text-gray-800 text-left" title={publication.title}>
                        {publication.title}
                      </h3>
                      <p className="text-xs text-gray-600 text-left">
                        Год: {publication.year}
                      </p>
                    </div>
                    
                    <div className="text-xs text-gray-700 text-left">
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
                        <p className="mb-2 flex">
                          <span className="font-medium text-gray-800 min-w-[80px]">Файл:</span>
                          <a href={`${url}/${publication.file}`} download className="text-blue-500 hover:text-blue-600 hover:underline flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            <div className="flex justify-center items-center min-h-[50vh] w-full">
              <p className="text-gray-600 text-lg">Публикации не найдены.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
