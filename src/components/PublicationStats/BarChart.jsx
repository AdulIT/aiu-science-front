import ReactApexChart from 'react-apexcharts';

export default function BarChart({
  series,
  labels,
  max,
  isHorizontal = false,
}) {
  const total = series.reduce((prev, cur) => prev + cur, 0) || 1;
  return (
    <ReactApexChart
      className='h-full min-h-fit  w-full'
      type='bar'
      series={[{ name: 'basic', data: series }]}
      options={{
        xaxis: {
          categories: labels,
        },
        dataLabels: {
          position: 'top',
          ...(isHorizontal
            ? {
                offsetX: 15,
                offsetY: 0,
              }
            : { offsetY: -15 }),
          style: ['#000000'],
          enabled: true,
          formatter: function (val, opt) {
            return Math.round((val / (max || total)) * 100) + '%';
          },
        },

        plotOptions: {
          bar: {
            horizontal: isHorizontal,
            dataLabels: {
              position: 'top',
            },
          },
        },
      }}
    />
  );
}