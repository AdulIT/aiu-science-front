import React, { useEffect, useState } from "react";
import CustomDialog from "../../../components/CustomDialog/CustomDialog";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { makeAuthenticatedRequest } from "../../../services/api";
const url = import.meta.env.VITE_API_URL;
export default function ADD({ updateData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
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
    setError,
  } = useForm();
  const clear = () => {
    reset();
    setFile(null);
    setErrorMessage(null);
  };
  const onClose = () => {
    setIsOpen(false);
    setCurrentStep(1);
    clear();
  };

  const onSubmit = async (data) => {
    setUploading(true)
    setErrorMessage(null);
    const token = localStorage.getItem("accessToken");

    if (!file) {
      setErrorMessage("File is required");
    setUploading(false)

      return
    }
    if (!token) {
      setErrorMessage("Ошибка авторизации. Пожалуйста, войдите снова.");
    setUploading(false)
    navigate("/login"); // Перенаправляем на страницу входа
      return;
    }

    const formData = new FormData();

    data.authors = data.authors
      .split(",")
      .map((author) => author.trim())
      .join(", ");

    formData.append("file", file);

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
        `${url}/api/user/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: formData,
        },
        navigate
      );

      if (response.status === 201) {
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
    setUploading(false)

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
 

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="py-2 px-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Добавить публикацию
      </button>
      <CustomDialog
        isOpen={isOpen}
        title={"Добавить публикацию"}
        onClose={onClose}
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col mb-6 bg-gray-50 p-4 rounded-lg shadow-inner"
        >
          {currentStep === 1 ? (
            <>
              <h2 className="text-xl font-bold mb-4">
                Выберите тип публикации
              </h2>
              <select
                {...register("publicationType", { required: "Type is required" })}
                className="w-full px-3 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Выберите тип публикации</option>
                <option value="scopus_wos">
                  Публикации Scopus и Web of Science
                </option>
                <option value="koknvo">Научные статьи в журналах КОКНВО</option>
                <option value="conference">
                  Публикации в материалах конференций
                </option>
                <option value="articles">
                  Научные статьи в периодических изданиях
                </option>
                <option value="books">
                  Монографии, учебные пособия и другие книги
                </option>
                <option value="patents">
                  Патенты, авторские свидетельства и другие охранные документы
                </option>
              </select>
              <span className="text-sm text-red-500">
                {errors.publicationType?.message}
              </span>
              <button
                onClick={() => {
                  if (!watch("publicationType")) {
                    setError("publicationType", {
                      message: "Type is required field",

                      type: "required",
                    });
                    return
                  }
                  setCurrentStep((prev) => prev + 1);
                }}
                type="button"
                className="place-self-end py-2 px-4 text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Следующий
              </button>
            </>
          ) : (
            <>
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
              {watch("publicationType") === "scopus_wos" && (
                <>
                  <label className="block mb-1 font-medium text-gray-700">
                    Ссылки, DOI
                  </label>
                  <input
                    type="text"
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
                    checked={watch("scopus")}
                    {...register("scopus")}
                    //   onChange={handleInputChange}
                  />
                  
                  <label className="block mb-1 font-medium text-gray-700">
                    WoS
                  </label>
                  <input
                    type="checkbox"
                    name="wos"
                    {...register("wos")}
                    checked={watch("wos")}
                  />
                </>
              )}
              {watch("publicationType") === "koknvo" && (
                <>
                  <label className="block mb-1 font-medium text-gray-700">
                    Ссылки, DOI
                  </label>
                  <input
                    type="text"
                    name="doi"
                    {...register("doi", { required: `DOI is required field` })}
                    className="w-full px-3 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                    <span className="text-sm text-red-500">
                {errors.doi?.message}
              </span>
                </>
              )}
              {watch("publicationType") === "books" && (
                <>
                  <label className="block mb-1 font-medium text-gray-700">
                    ISBN
                  </label>
                  <input
                    type="text"
                    name="isbn"
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
                <span className="text-sm text-red-500">
                {errorMessage}
              </span>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep((prev) => prev - 1);
                    clear();
                  }}
                  className="py-2 px-4 text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  Назад
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="py-2 px-4 text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Сохранить публикацию
                </button>
              </div>
            </>
          )}
        </form>
      </CustomDialog>
    </>
  );
}
