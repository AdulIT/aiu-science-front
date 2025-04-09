import { makeAuthenticatedRequest } from '../services/api'
import { useNavigate } from 'react-router-dom'

export async function generateReport(url, navigate) {
  try {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      alert('Авторизуйтесь перед генерацией отчета.')
      navigate('/login')
      return
    }

    const response = await makeAuthenticatedRequest(
      `${url}/api/admin/generateAllPublicationsReport`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob',
      },
      navigate
    )

    if (response.status===200) {
      const blob = await response.data;
      const reportUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = reportUrl
      a.download = 'all_publications_report.docx'
      document.body.appendChild(a)
      a.click()
      a.remove()
    } else {
      alert('Ошибка при генерации отчета.')
    }
  } catch (error) {
    console.error('Ошибка при генерации отчета:', error)
    alert('Произошла ошибка при генерации отчета.')
  }
}

export async function generateUserReport(url, navigate, iin) {
  try {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      alert('Авторизуйтесь перед генерацией отчета.')
      navigate('/login')
      return
    }

    const response = await makeAuthenticatedRequest(
      `${url}/api/admin/generateUserReport`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        responseType: 'blob',
        data: JSON.stringify({ iin }),
      },
      navigate
    )

    if (response.status===200) {
      const blob = await response.data
      const reportUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = reportUrl
      a.download = `${iin}_report.docx`
      document.body.appendChild(a)
      a.click()
      a.remove()
    } else {
      const errorText = await response.text()
      console.error('Error response from server:', errorText)
      alert(`Ошибка при генерации отчета по пользователю: ${errorText}`)
    }
  } catch (error) {
    console.error('Error in generateUserReport:', error)
    alert('Произошла ошибка при генерации отчета по пользователю.')
  }
}
