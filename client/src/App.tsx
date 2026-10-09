import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './store/AuthContext';
import { WatchlistProvider } from './store/WatchlistContext';
import { ToastProvider } from './store/ToastContext';
import { TitleModalProvider } from './store/TitleModalContext';
import { ProfileProvider } from './store/ProfileContext';
import { TVRemoteProvider } from './store/TVRemoteContext';
import { NetflixDetailModal } from './components/NetflixDetailModal';

// Layouts
import { MainLayout } from './layouts/MainLayout';

// Public & User Pages
import { Home } from './pages/Home';
import { Movies } from './pages/Movies';
import { MovieDetail } from './pages/MovieDetail';
import { Series } from './pages/Series';
import { SeriesDetail } from './pages/SeriesDetail';
import { Player } from './pages/Player';
import { Search } from './pages/Search';
import { MyList } from './pages/MyList';
import { WatchHistory } from './pages/WatchHistory';
import { Profiles } from './pages/Profiles';

export function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <ProfileProvider>
            <WatchlistProvider>
              <TitleModalProvider>
                <TVRemoteProvider>
                  <Routes>
                    {/* Standalone Profiles Route */}
                    <Route path="/profiles" element={<Profiles />} />
                    <Route path="/manage-profiles" element={<Profiles />} />

                    {/* Standalone Player Routes (Full viewport immersion) */}
                    <Route path="/watch/tv/:tmdbId/:season/:episode" element={<Player />} />
                    <Route path="/watch/:type/:id/:season/:episode" element={<Player />} />
                    <Route path="/watch/:type/:id" element={<Player />} />

                    {/* Main Public & Viewer Layout */}
                    <Route element={<MainLayout />}>
                      <Route path="/" element={<Home />} />
                      <Route path="/movies" element={<Movies />} />
                      <Route path="/movie/:slug" element={<MovieDetail />} />
                      <Route path="/series" element={<Series />} />
                      <Route path="/series/:slug" element={<SeriesDetail />} />
                      <Route path="/search" element={<Search />} />
                      <Route path="/my-list" element={<MyList />} />
                      <Route path="/history" element={<WatchHistory />} />
                    </Route>

                    {/* Catch-all Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>

                  {/* Global Netflix Details Modal */}
                  <NetflixDetailModal />
                </TVRemoteProvider>
              </TitleModalProvider>
            </WatchlistProvider>
          </ProfileProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
