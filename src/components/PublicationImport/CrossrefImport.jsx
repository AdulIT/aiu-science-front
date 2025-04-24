import { useState } from 'react';
import { crossrefService } from '../../services/crossrefService';

// Количество публикаций на странице
const ITEMS_PER_PAGE = 3;

export default function CrossrefImport() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Вычисляем общее количество страниц
  const totalPages = Math.ceil(searchResults.length / ITEMS_PER_PAGE);

  // Получаем публикации для текущей страницы
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return searchResults.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  // Поиск публикаций
  const handleSearch = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setCurrentPage(1); // Сбрасываем страницу при новом поиске
    try {
      const results = await crossrefService.searchWorksByAuthor(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching publications:', error);
      alert('Ошибка при поиске публикаций');
    } finally {
      setIsLoading(false);
    }
  };

  // Открыть публикацию по DOI
  const handlePublicationClick = (doi) => {
    if (!doi) return;
    const doiUrl = doi.startsWith('http') ? doi : `https://doi.org/${doi}`;
    window.open(doiUrl, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Поиск публикаций в Crossref</h2>
      
      {/* Форма поиска */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Введите имя автора или DOI публикации..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 shadow-sm transition-colors"
          >
            {isLoading ? 'Поиск...' : 'Найти'}
          </button>
        </div>
      </form>

      {/* Результаты поиска */}
      {searchResults.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Результаты поиска</h3>
          <div className="space-y-4">
            {getCurrentPageItems().map((publication) => (
              <div
                key={publication.doi}
                onClick={() => handlePublicationClick(publication.doi)}
                className="p-6 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md hover:border-blue-300 group"
              >
                <h4 className="font-medium text-lg mb-2 text-gray-900 group-hover:text-blue-600">{publication.title}</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><span className="font-medium">Авторы:</span> {publication.authors}</p>
                  <p><span className="font-medium">Журнал:</span> {publication.journal} ({publication.year})</p>
                  <p><span className="font-medium">DOI:</span> 
                    <span className="text-blue-600 hover:underline ml-1">{publication.doi}</span>
                  </p>
                  <p><span className="font-medium">Цитирований:</span> {publication.citations || 0}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Пагинация */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-6">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                ←
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-lg border ${
                    currentPage === page
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  } transition-colors`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 