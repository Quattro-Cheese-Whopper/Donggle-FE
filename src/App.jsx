import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Vite + React + Tailwind CSS
        </h1>
        <p className="text-gray-600">
          Tailwind CSS가 성공적으로 설정되었습니다! 이제 Tailwind 클래스를 사용하여 
          스타일을 적용할 수 있습니다.
        </p>
        <button className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors">
          시작하기
        </button>
      </div>
    </div>
  );
}

export default App
