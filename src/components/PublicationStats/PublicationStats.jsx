import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { makeAuthenticatedRequest } from "../../services/api";
import { jwtDecode } from "jwt-decode";
import ReactApexChart from "react-apexcharts";
import BarChart from "./BarChart";
import { publicationTypeMap } from "../../pages/PublicationPage/PublicationsPage";
import LineChart from "./LineChart";
const url = import.meta.env.VITE_API_URL;
export default function PublicationStats() {
  const [data, setData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          navigate("/login");
          return;
        }

        const decodedToken = jwtDecode(token);
        // if (decodedToken.role !== 'admin') {
        //   navigate('/home-user');
        //   return;
        // }

        const response = await makeAuthenticatedRequest(
          `${url}/api/user/stats`,
          { method: "GET", headers: { Authorization: `Bearer ${token}` } },
          navigate
        );

        if (response.status === 200) {
          console.log("sasts успешно загружены!");
          console.log(response);
          setData(response.data); // Здесь данные из Axios
        } else {
          alert("Не удалось загрузить stats");
        }
      } catch (error) {
        alert("Произошла ошибка при загрузке stats");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  return (
    <div className="flex flex-col items-center gap-2">
        <div className="flex flex-col w-[72rem] h-full">
          {data?.types && (
            <BarChart
              labels={Object.keys(data.types).map(
                (k) => publicationTypeMap[k]
              )}
              series={Object.keys(data.types).map((k) => data.types[k])}
            />
          )}
              {data?.years && (
            <LineChart
              labels={Object.keys(data.years)}
              series={Object.keys(data.years).map((k) => data.years[k])}
            />
          )}
        </div>
    </div>
  );
}
