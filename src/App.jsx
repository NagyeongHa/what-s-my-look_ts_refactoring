import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './routes/Home';
import Liked from './routes/Liked';
import { Suspense } from 'react';

function App() {
  //여기서 유저검증 && 파이어베이스 토큰 체크하고 조건부 라우팅 하면 될듯

  return (
    <Suspense fallback={'loading'}>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/liked' element={<Liked />} />
        </Routes>
      </BrowserRouter>
    </Suspense>
  );
}

export default App;