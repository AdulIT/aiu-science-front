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
  ListboxOption,
  ListboxOptions,
  Select,
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
        setPublications(response.data); // Здесь данные из Axios
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
        <p className="text-lg font-bold">Загрузка...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar role="admin" />
      <div className="min-h-screen bg-gray-100 p-8">
        <h1 className="text-2xl font-bold">Публикации всех сотрудников</h1>
        <button
          onClick={() => generateReport(url, navigate)}
          className="mt-2 py-2 px-4 text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Генерировать отчет
        </button>
        <PublicationComponents setYear={setYear} setName={setName} setSchool={setSchool} setType={setType} school={school} type={type}/>
        <div>
          {publications.length > 0 ? (
            publications.map((publication, index) => (
              <div
                key={publication._id}
                className="mb-4 p-4 border border-gray-300 rounded-lg bg-white"
              >
                <p>
                  <strong>Тип публикации:</strong>{" "}
                  {publicationTypeMap[publication.publicationType]}
                </p>
                <p>
                  <strong>Авторы:</strong> {publication.authors}
                </p>
                <p>
                  <strong>Название статьи:</strong> {publication.title}
                </p>
                <p>
                  <strong>Год:</strong> {publication.year}
                </p>
                <p>
                  <strong>Выходные данные:</strong> {publication.output}
                </p>
                {publication.doi && (
                  <p>
                    <strong>Ссылки, DOI:</strong> {publication.doi}
                  </p>
                )}
                {publication.isbn && (
                  <p>
                    <strong>ISBN:</strong> {publication.isbn}
                  </p>
                )}
                {publication.file && (
                  <p>
                    <strong>Файл:</strong>{" "}
                    <a
                      href={`${url}/${publication.file}`}
                      download
                      className="text-blue-600 hover:underline"
                    >
                      Скачать файл
                    </a>
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
      </div>
    </>
  );
}
