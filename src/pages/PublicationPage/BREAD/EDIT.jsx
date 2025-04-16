import React, { useState } from "react";
import CustomDialog from "../../../components/CustomDialog/CustomDialog";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { makeAuthenticatedRequest } from "../../../services/api";
const url = import.meta.env.VITE_API_URL;

export default function EDIT({ pub, updateData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    watch,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const clear = () => {
    reset();
    setFile(null);
    setErrorMessage(null);
  };
  const onClose = () => {
    setIsOpen(false);
    clear();
  };

  const onSubmit = async (data) => {
    setUploading(true);
    setErrorMessage(null);
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setErrorMessage("Ошибка авторизации. Пожалуйста, войдите снова.");
      setUploading(false);
      navigate("/login"); // Перенаправляем на страницу входа
      return;
    }

    const formData = new FormData();

    data.authors = data.authors
      .split(",")
      .map((author) => author.trim())
      .join(", ");
    if (file) {
      formData.append("file", file);
    }

    Object.keys(data).forEach((key) => {
      if (key === "authors") {
        console.log(data.authors.split(","));
        formData.append(key, data.authors.split(","));
      } else {
        formData.append(key, data[key]);
      }
    });

    formData.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });

    try {
      const response = await makeAuthenticatedRequest(
        `${url}/api/admin/publications/${pub._id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          data: formData,
        },
        navigate
      );

      if (response.status === 200) {
        if (updateData) {
          updateData();
        }

        onClose();
      } else {
        // console.error('Ошибка при добавлении публикации')
        // const errorData = await response.json();
        // setErrorMessage(`Ошибка: ${errorData.message}`);
      }
    } catch (error) {
      console.log(error);
      setErrorMessage(
        "Произошла ошибка при добавлении публикации. Попробуйте снова."
      );
    }
    setUploading(false);
  };

  const handleFileChange = (e) => {
    setErrorMessage(null);
    const file = e.target.files[0];

    if (file && file.size > 5 * 1024 * 1024) {
      setErrorMessage("Файл не должен превышать 5MB.");
      e.target.value = "";
      return;
    }

    if (file && !file.name.toLowerCase().endsWith(".pdf")) {
      setErrorMessage("Допустим только формат PDF.");
      e.target.value = "";
      return;
    }

    setFile(file);
  };

  console.log(pub);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="py-1 px-2 text-xs text-white bg-indigo-500 rounded-lg hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Редактировать
      </button>
      <CustomDialog isOpen={isOpen} title={"Редактировать публикацию"} onClose={onClose}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col w-full"
        >
          <h2 className="text-xl font-bold mb-4 text-gray-800">Текущая публикация</h2>
          {[
            { title: "authors", label: "Авторы", validate: () => {} },
            { title: "title", label: "Название", validate: () => {} },
            {
              title: "year",
              label: "Год",
              validate: (value) => {
                const regex = /^\d{4}$/;
                if (!regex.test(value)) {
                  return "Year must be exactly 4 digits";
                }
                return true;
              },
            },
          ].map((field) => (
            <div key={field.title} className="mb-4">
              <label className="block mb-1 font-medium text-gray-700">
                {field.label}
              </label>
              <input
                type="text"
                name={field.title}
                defaultValue={pub?.[field.title]}
                {...register(field.title, {
                  validate: field.validate,
                  required: `${field.title} is required field`,
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
              />
              <span className="text-sm text-red-500">
                {errors[field.title]?.message}
              </span>
            </div>
          ))}

          <div className="mb-4">
            <label className="block mb-1 font-medium text-gray-700">
              Выходные данные
            </label>
            <textarea
              name="output"
              defaultValue={pub?.output}
              {...register("output", {
                required: `Output is required field`,
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
              rows={3}
            />
            <span className="text-sm text-red-500">
              {errors.output?.message}
            </span>
          </div>

          {pub?.publicationType === "scopus_wos" && (
            <>
              <label className="block mb-1 font-medium text-gray-700">
                Ссылки, DOI
              </label>
              <input
                type="text"
                defaultValue={pub?.doi}
                name="doi"
                {...register("doi", { required: `DOI is required field` })}
                className="w-full px-3 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
              />
              <span className="text-sm text-red-500">
                {errors.doi?.message}
              </span>
              <div className="flex flex-col space-y-3 mb-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="scopus"
                    defaultChecked={pub?.scopus}
                    {...register("scopus")}
                    className="w-4 h-4 mr-3"
                  />
                  <label className="font-medium text-gray-700">Scopus</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="wos"
                    defaultChecked={pub?.wos}
                    {...register("wos")}
                    className="w-4 h-4 mr-3"
                  />
                  <label className="font-medium text-gray-700">WoS</label>
                </div>
              </div>
            </>
          )}
          {pub?.publicationType === "koknvo" && (
            <>
              <label className="block mb-1 font-medium text-gray-700">
                Ссылки, DOI
              </label>
              <input
                type="text"
                name="doi"
                defaultValue={pub?.doi}
                {...register("doi", { required: `DOI is required field` })}
                className="w-full px-3 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
              />
              <span className="text-sm text-red-500">
                {errors.doi?.message}
              </span>
            </>
          )}
          {pub?.publicationType === "books" && (
            <>
              <label className="block mb-1 font-medium text-gray-700">
                ISBN
              </label>
              <input
                type="text"
                name="isbn"
                defaultValue={pub?.isbn}
                {...register("isbn", {
                  required: `ISBN is required field`,
                })}
                className="w-full px-3 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
              />
              <span className="text-sm text-red-500">
                {errors.isbn?.message}
              </span>
            </>
          )}
          {pub?.publicationType === "patents" && (
            <>
              <label className="block mb-1 font-medium text-gray-700">
                DOI патента
              </label>
              <input
                type="text"
                name="patentDoi"
                defaultValue={pub?.patentDoi}
                {...register("patentDoi", {
                  required: `Patent DOI is required field`,
                })}
                className="w-full px-3 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
              />
              <span className="text-sm text-red-500">
                {errors.patentDoi?.message}
              </span>
            </>
          )}

          <div className="mb-4">
            <label className="block mb-1 font-medium text-gray-700">
              Загрузить файл (PDF, макс. 5MB)
            </label>
            <input
              type="file"
              name="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {errorMessage && (
              <span className="text-sm text-red-500">{errorMessage}</span>
            )}
            {errors.file && (
              <span className="text-sm text-red-500">
                {errors.file?.message}
              </span>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="submit"
              disabled={uploading}
              className="py-2 px-4 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {uploading ? "Загрузка..." : "Сохранить"}
            </button>
          </div>
        </form>
      </CustomDialog>
    </>
  );
}
