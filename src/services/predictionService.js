export const predictionService = {
  // Простой метод линейной экстраполяции
  predictNextYearPublications(publications) {
    console.log('Input publications:', publications);
    
    const currentYear = new Date().getFullYear();
    const grouped = {};
    let totalPublications = 0;
    
    // Группируем публикации по годам, исключая будущие годы
    publications.forEach(pub => {
      const year = parseInt(pub.year);
      // Пропускаем публикации с датой в будущем
      if (year > currentYear) return;
      
      if (!grouped[year]) grouped[year] = 0;
      grouped[year]++;
      totalPublications++;
    });

    console.log('Total historical publications:', totalPublications);
    console.log('Grouped by year (excluding future):', grouped);

    const years = Object.keys(grouped).map(Number).sort((a, b) => a - b);
    console.log('Sorted years:', years);

    // Если нет исторических данных или только один год
    if (years.length < 2) {
      // Возвращаем прогноз на основе среднего количества публикаций в год
      const avgPublicationsPerYear = totalPublications / Math.max(1, years.length);
      const prediction = Math.round(avgPublicationsPerYear);
      console.log('Not enough historical data, predicting based on average:', prediction);
      return prediction;
    }

    // Рассчитываем изменение по годам
    const yearlyChanges = [];
    for (let i = 1; i < years.length; i++) {
      const prevYear = years[i - 1];
      const currYear = years[i];
      const prevCount = grouped[prevYear];
      const currCount = grouped[currYear];
      yearlyChanges.push({
        year: currYear,
        change: currCount - prevCount,
        count: currCount
      });
    }

    console.log('Yearly changes:', yearlyChanges);

    // Рассчитываем средний прирост за последние 2 года (если есть)
    const recentChanges = yearlyChanges.slice(-2);
    const avgRecentChange = recentChanges.reduce((sum, change) => sum + change.change, 0) / recentChanges.length;

    console.log('Average recent change:', avgRecentChange);

    // Последнее известное количество публикаций за год
    const latestYear = years[years.length - 1];
    const latestYearCount = grouped[latestYear];

    // Прогноз на следующий год = последнее количество + средний прирост
    const prediction = Math.max(0, Math.round(latestYearCount + avgRecentChange));
    
    console.log('Latest year count:', latestYearCount);
    console.log('Predicted for next year:', prediction);

    return prediction;
  },

  // Метод с использованием линейной регрессии
  predictWithLinearRegression(publications) {
    const grouped = {};
    
    publications.forEach(pub => {
      if (!grouped[pub.year]) grouped[pub.year] = 0;
      grouped[pub.year]++;
    });

    const years = Object.keys(grouped).sort();
    if (years.length < 2) return grouped[years[years.length - 1]] || 0;

    // Преобразуем данные для регрессии
    const x = years.map(Number);
    const y = years.map(year => grouped[year]);

    // Рассчитываем коэффициенты линейной регрессии
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Предсказываем для следующего года
    const nextYear = Math.max(...x) + 1;
    return Math.round(slope * nextYear + intercept);
  },

  // Анализ тренда публикационной активности
  analyzePublicationTrend(publications) {
    console.log('Analyzing trend for publications:', publications);
    
    const currentYear = new Date().getFullYear();
    const grouped = {};
    
    // Исключаем будущие публикации из анализа тренда
    publications.forEach(pub => {
      const year = parseInt(pub.year);
      if (year > currentYear) return;
      
      if (!grouped[year]) grouped[year] = 0;
      grouped[year]++;
    });

    console.log('Grouped by year (excluding future):', grouped);

    const years = Object.keys(grouped).map(Number).sort((a, b) => a - b);
    
    if (years.length < 2) {
      return { trend: 'stable', growth: 0 };
    }

    // Рассчитываем изменение за последние годы
    const yearlyChanges = [];
    for (let i = 1; i < years.length; i++) {
      const prevYear = years[i - 1];
      const currYear = years[i];
      yearlyChanges.push(grouped[currYear] - grouped[prevYear]);
    }

    // Среднее изменение за последние 2 года (если есть)
    const recentChanges = yearlyChanges.slice(-2);
    const avgChange = recentChanges.reduce((sum, change) => sum + change, 0) / recentChanges.length;

    const trend = {
      trend: avgChange > 0.1 ? 'growing' : avgChange < -0.1 ? 'declining' : 'stable',
      growth: avgChange
    };

    console.log('Trend analysis:', trend);
    return trend;
  }
}; 