import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { HomePage } from './pages/HomePage'
import { CoursePage } from './pages/CoursePage'
import { LessonPage } from './pages/LessonPage'
import { PracticePage } from './pages/PracticePage'
import { ProfilePage } from './pages/ProfilePage'
import { TipsPage } from './pages/TipsPage'
import { RoutinePage } from './pages/RoutinePage'
import { ChordsPage } from './pages/ChordsPage'
import { ChordDetailPage } from './pages/ChordDetailPage'
import { TunerPage } from './pages/TunerPage'
import { MetronomePage } from './pages/MetronomePage'
import { SimulatorPage } from './pages/SimulatorPage'
import { OneMinutePage } from './pages/OneMinutePage'
import { EditorPage } from './pages/EditorPage'
import { GamePage } from './pages/GamePage'
import { EarPage } from './pages/EarPage'
import { RecognizePage } from './pages/RecognizePage'
import { SongsPage, SongPage } from './pages/SongsPage'

/**
 * Rutele aplicației. Folosim HashRouter (#/curs/...) ca aplicația să meargă
 * pe orice hosting static și offline, fără configurare de server.
 */
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="curs" element={<CoursePage />} />
          <Route path="curs/:lessonId" element={<LessonPage />} />
          <Route path="exersare" element={<PracticePage />} />
          <Route path="exersare/acordor" element={<TunerPage />} />
          <Route path="exersare/metronom" element={<MetronomePage />} />
          <Route path="exersare/schimbari" element={<OneMinutePage />} />
          <Route path="exersare/progresii" element={<EditorPage />} />
          <Route path="exersare/joc" element={<GamePage />} />
          <Route path="exersare/auz" element={<EarPage />} />
          <Route path="exersare/recunoastere" element={<RecognizePage />} />
          <Route path="acorduri" element={<ChordsPage />} />
          <Route path="acorduri/:name" element={<ChordDetailPage />} />
          <Route path="cantece" element={<SongsPage />} />
          <Route path="cantece/:songId" element={<SongPage />} />
          <Route path="simulator" element={<SimulatorPage />} />
          <Route path="rutina" element={<RoutinePage />} />
          <Route path="sfaturi" element={<TipsPage />} />
          <Route path="profil" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
