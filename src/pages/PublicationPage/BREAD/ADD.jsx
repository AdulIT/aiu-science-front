import React, { useEffect, useState } from "react";
import CustomDialog from "../../../components/CustomDialog/CustomDialog";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { makeAuthenticatedRequest } from "../../../services/api";
import { publicationTypeMap } from "../PublicationsPage"; 
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from "@headlessui/react";

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
    setValue,
    getValues,
  } = useForm();

  useEffect(() => {
    register("publicationType", { required: "Type is required" });
  }, [register]);

  const selectedPublicationType = watch("publicationType");

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
    setUploading(true);
    setErrorMessage(null);
    const token = localStorage.getItem("accessToken");

    if (!file) {
      setErrorMessage("File is required");
      setUploading(false);
      return;
    }
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
 

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full sm:w-auto py-2 px-4 text-sm text-white bg-gray-700 hover:bg-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-200"
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
          className="flex flex-col w-full"
        >
          {currentStep === 1 ? (
            <>
              <h2 className="text-xl font-bold mb-4 text-white">
                Выберите тип публикации
              </h2>
              <div className="w-full mb-4">
                <Listbox
                  value={selectedPublicationType}
                  onChange={(value) => setValue("publicationType", value)}
                >
                  <div className="relative">
                    <ListboxButton className="w-full border border-gray-600 bg-[#2a2a2a] text-left px-4 py-2 cursor-pointer rounded-lg hover:border-gray-500 transition-colors duration-200 text-white">
                      <span className="block overflow-hidden whitespace-nowrap text-ellipsis">
                        {selectedPublicationType
                          ? publicationTypeMap[selectedPublicationType]
                          : "Выберите тип публикации"}
                      </span>
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M10 3a.75.75 0 01.53.22l3.5 3.5a.75.75 0 01-1.06 1.06L10 4.81 6.03 8.78a.75.75 0 01-1.06-1.06l3.5-3.5A.75.75 0 0110 3zm-3.97 9.28a.75.75 0 011.06 0L10 15.19l2.97-2.91a.75.75 0 111.06 1.06l-3.5 3.5a.75.75 0 01-1.06 0l-3.5-3.5a.75.75 0 010-1.06z" clipRule="evenodd" />
                        </svg>
                      </span>
                    </ListboxButton>
                    <ListboxOptions className="absolute z-10 mt-1 w-full rounded-lg shadow-lg overflow-hidden bg-[#2a2a2a] border border-gray-600">
                      {Object.entries(publicationTypeMap).map(([value, label]) => (
                        <ListboxOption
                          key={value}
                          value={value}
                          className={({ active }) =>
                            `py-2 px-4 cursor-pointer ${active ? 'bg-blue-600 text-white' : 'text-gray-300'}`
                          }
                        >
                          {label}
                        </ListboxOption>
                      ))}
                    </ListboxOptions>
                  </div>
                </Listbox>
              </div>
              <span className="text-sm text-red-500">
                {errors.publicationType?.message}
              </span>
              <button
                onClick={() => {
                  const publicationType = getValues("publicationType");
                  if (!publicationType) {
                    setError("publicationType", {
                      message: "Type is required field",
                      type: "required",
                    });
                    return;
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
              <h2 className="text-xl font-bold mb-4 text-white">Новая публикация</h2>
              {[
                { title: "authors", label: "Авторы", validate: () => {} },
                { title: "title", label: "Название", validate: () => {} },
                {
                  title: "year",
                  label: "Год",
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
                  <label className="block mb-1 font-medium text-gray-200">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    name={field.title}
                    {...register(field.title, {
                      validate: field.validate,
                      required: `${field.title} is required field`,
                    })}
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#2a2a2a] text-white"
                  />
                    <span className="text-sm text-red-500">
                  {errors[field.title]?.message}
                </span>
                </div>
              ))}

              <div className="mb-4">
                <label className="block mb-1 font-medium text-gray-200">
                  Выходные данные
                </label>
                <textarea
                  name="output"
                  {...register("output", {
                    required: `Output is required field`,
                  })}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#2a2a2a] text-white"
                  rows={3}
                />
                  <span className="text-sm text-red-500">
                  {errors.output?.message}
                </span>
              </div>
              {watch("publicationType") === "scopus_wos" && (
                <>
                  <label className="block mb-1 font-medium text-gray-200">
                    Ссылки, DOI
                  </label>
                  <input
                    type="text"
                    name="doi"
                    {...register("doi", { required: `DOI is required field` })}
                    className="w-full px-3 py-2 mb-4 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#2a2a2a] text-white"
                  />
                  <span className="text-sm text-red-500">
                    {errors.doi?.message}
                  </span>
                  <div className="flex flex-col space-y-2 mb-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="scopus"
                        checked={watch("scopus")}
                        {...register("scopus")}
                        className="w-4 h-4"
                      />
                      <label className="font-medium text-gray-200">Scopus</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="wos"
                        {...register("wos")}
                        checked={watch("wos")}
                        className="w-4 h-4"
                      />
                      <label className="font-medium text-gray-200">WoS</label>
                    </div>
                  </div>
                </>
              )}
              {watch("publicationType") === "koknvo" && (
                <>
                  <label className="block mb-1 font-medium text-gray-200">
                    Ссылки, DOI
                  </label>
                  <input
                    type="text"
                    name="doi"
                    {...register("doi", { required: `DOI is required field` })}
                    className="w-full px-3 py-2 mb-4 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#2a2a2a] text-white"
                  />
                    <span className="text-sm text-red-500">
                  {errors.doi?.message}
                </span>
                </>
              )}
              {watch("publicationType") === "books" && (
                <>
                  <label className="block mb-1 font-medium text-gray-200">
                    ISBN
                  </label>
                  <input
                    type="text"
                    name="isbn"
                    {...register("isbn", {
                      required: `ISBN is required field`,
                    })}
                    className="w-full px-3 py-2 mb-4 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#2a2a2a] text-white"
                  />
                    <span className="text-sm text-red-500">
                  {errors.isbn?.message}
                </span>
                </>
              )}

              <div className="mt-2">
                <label className="block mb-1 font-medium text-gray-200">
                  Загрузить файл (PDF)
                </label>
                <div className="flex items-center w-full">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf"
                    className="mb-4 hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer py-2 px-4 text-sm font-semibold text-gray-200 bg-gray-700 rounded-lg hover:bg-gray-600 whitespace-nowrap flex-shrink-0"
                  >
                    Выберите файл
                  </label>
                  <div className="ml-2 overflow-hidden flex-1">
                    {!file && <span className="text-gray-400">Файл не выбран</span>}
                    {file && <span className="text-gray-400 truncate block">{file.name}</span>}
                  </div>
                </div>
                <span className="text-sm text-red-500">
                  {errorMessage}
                </span>
              </div>

              <div className="flex justify-between mt-8 space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep((prev) => prev - 1);
                    clear();
                  }}
                  className="py-2 px-4 text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 whitespace-nowrap"
                >
                  Назад
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="py-2 px-4 text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 whitespace-nowrap"
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
