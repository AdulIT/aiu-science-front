import ReactApexChart from "react-apexcharts";

export default function LineChart({
  series,
  seriesName,
  labels,
}) {

//   const total = series.reduce((prev, cur) => prev + cur, 0) || 1;
  return (
    <ReactApexChart
      className="h-full min-h-fit  w-full"
      type="line"
      series={[{ name: "basic", data: series }]}
      options={{
        series: [
          {
            name: seriesName,
            data: series,
          },
        ],
        chart: {
          height: 350,
          type: "line",
          zoom: {
            enabled: false,
          },
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          curve: "straight",
        },
        
        grid: {
          row: {
            colors: ["#f3f3f3", "transparent"], // takes an array which will be repeated on columns
            opacity: 0.5,
          },
        },
        xaxis: {
          categories: labels,
        },
      }}
    />
  );
}
