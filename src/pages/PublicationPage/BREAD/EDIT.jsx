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
        className="py-1 px-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        edit
      </button>
      <CustomDialog isOpen={isOpen} title={"Edit"} onClose={onClose}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col mb-6 bg-gray-50 p-4 rounded-lg shadow-inner"
        >
          <h2 className="text-xl font-bold mb-4">Новая публикация</h2>
          {[
            { title: "authors", validate: () => {} },
            { title: "title", validate: () => {} },
            {
              title: "year",
              validate: (value) => {
                // Ensure the input has exactly 4 digits
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
                {field.title === "authors" && "Авторы"}
                {field.title === "title" && "Название"}
                {field.title === "year" && "Год"}
              </label>
              <input
                type="text"
                name={field.title}
                defaultValue={pub?.[field.title]}
                {...register(field.title, {
                  validate: field.validate,
                  required: `${field.title} is required field`,
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-red-500">
                {errors.doi?.message}
              </span>
              <label className="block mb-1 font-medium text-gray-700">
                Scopus
              </label>
              <input
                type="checkbox"
                name="scopus"
                defaultChecked={pub?.scopus}
                {...register("scopus")}
                //   onChange={handleInputChange}
              />

              <label className="block mb-1 font-medium text-gray-700">
                WoS
              </label>
              {pub?.wos && 1}
              <input
                type="checkbox"
                name="wos"
                defaultChecked={pub?.wos}
                {...register("wos")}
              />
            </>
          )}
          {pub?.publicationType === "koknvo" && (
            <>
              <label className="block mb-1 font-medium text-gray-700">
                Ссылки, DOI
              </label>
              <input
                type="text"
                defaultValue={pub?.doi}
                name="doi"
                {...register("doi", { required: `DOI is required field` })}
                className="w-full px-3 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-red-500">
                {errors.isbn?.message}
              </span>
            </>
          )}

          <label className="block mb-1 font-medium text-gray-700">
            Загрузить файл (PDF)
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf"
            className="mb-4"
          />
          <a className="text-sm text-blue-500 hover:underline" href={pub.file}>
            {pub.file}
          </a>
          <span className="text-sm text-red-500">{errorMessage}</span>

          <div className="flex flex-row justify-end">
            <button
              type="submit"
              disabled={uploading}
              className="py-2 px-4 text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Сохранить публикацию
            </button>
          </div>
        </form>
      </CustomDialog>
    </>
  );
}
