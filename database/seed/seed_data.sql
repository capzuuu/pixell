-- Pixell Streaming Platform MVP - Seed Data SQL Script
-- Loads initial genres, users (Admin: Admin123!, Demo: User123!), movies, series, seasons, episodes

-- 1. Insert Genres
INSERT INTO genres (id, name, slug) VALUES
('g-action', 'Action & Adventure', 'action-adventure'),
('g-scifi', 'Sci-Fi & Cyberpunk', 'scifi-cyberpunk'),
('g-mystery', 'Mystery & Thriller', 'mystery-thriller'),
('g-drama', 'Drama & Romance', 'drama-romance'),
('g-fantasy', 'Fantasy & Supernatural', 'fantasy-supernatural'),
('g-crime', 'Crime & Noir', 'crime-noir'),
('g-animation', 'Animation & Anime', 'animation-anime'),
('g-comedy', 'Comedy & Satire', 'comedy-satire'),
('g-horror', 'Horror & Psychological', 'horror-psychological'),
('g-documentary', 'Documentary & Tech', 'documentary-tech')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Users (Bcrypt hash for Admin123! and User123!)
INSERT INTO users (id, name, email, password_hash, role, avatar) VALUES
('u-admin', 'Pixell Administrator', 'admin@pixell.tv', '$2a$10$wKxN0sL8hI7e8O.x6z4q7OP91fHlDq2P8vF0wZ.Hl3vH0JkKk5Uia', 'ADMIN', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'),
('u-demo', 'Alex Chen', 'demo@pixell.tv', '$2a$10$y5Xq8vK8hI7e8O.x6z4q7OP91fHlDq2P8vF0wZ.Hl3vH0JkKk5Uib', 'USER', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'),
('u-sarah', 'Sarah Jenkins', 'sarah@pixell.tv', '$2a$10$y5Xq8vK8hI7e8O.x6z4q7OP91fHlDq2P8vF0wZ.Hl3vH0JkKk5Uib', 'USER', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80')
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Movies
INSERT INTO movies (id, title, slug, description, poster_url, backdrop_url, trailer_url, video_url, release_year, duration, rating, language, country, is_featured, is_published) VALUES
('m-midnight-horizon', 'Midnight Horizon', 'midnight-horizon', 'In a neon-drenched metropolis on the brink of ecological collapse, an elite cybernetic investigator unearths a clandestine conspiracy.', 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1920&auto=format&fit=crop&q=80', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', 2025, 124, 'PG-13', 'English', 'United States', TRUE, TRUE),
('m-the-last-signal', 'The Last Signal', 'the-last-signal', 'Deep within the silence of the Arctic listening post, a lonely radio astronomer intercepts a repeating signal originating outside the universe.', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1920&auto=format&fit=crop&q=80', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', 2024, 118, 'PG-13', 'English', 'Canada', TRUE, TRUE),
('m-neon-summer', 'Neon Summer', 'neon-summer', 'During the sweltering heat of 1989, three high school outcasts uncover an encrypted cassette tape pulling them into espionage.', 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1920&auto=format&fit=crop&q=80', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 2025, 105, 'R', 'English', 'United States', FALSE, TRUE),
('m-beyond-the-island', 'Beyond the Island', 'beyond-the-island', 'A group of shipwreck survivors discover an uncharted archipelago inhabited by ancient megafauna and ancient relics.', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&auto=format&fit=crop&q=80', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 2023, 132, 'PG-13', 'English', 'Australia', TRUE, TRUE),
('m-echoes-of-tomorrow', 'Echoes of Tomorrow', 'echoes-of-tomorrow', 'When a quantum physicist accidentally creates a chronal loop, she must work backward through fractured timelines.', 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1920&auto=format&fit=crop&q=80', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', 2024, 110, 'PG-13', 'English', 'United Kingdom', FALSE, TRUE),
('m-the-forgotten-road', 'The Forgotten Road', 'the-forgotten-road', 'A retired detective driving across the Mojave Desert stumbles upon a deserted diner with a dark secret tying back to a cold case.', 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&auto=format&fit=crop&q=80', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', 2024, 115, 'R', 'English', 'United States', FALSE, TRUE),
('m-shadow-protocol', 'Shadow Protocol', 'shadow-protocol', 'Disavowed by his own agency, an elite black-ops operative must team up with a rogue cyber analyst.', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1920&auto=format&fit=crop&q=80', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 2025, 128, 'PG-13', 'English', 'United States', TRUE, TRUE),
('m-crimson-skies', 'Crimson Skies', 'crimson-skies', 'In a world of floating sky islands and airship armadas, a rebellious captain leads an expedition into the eternal storm.', 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&auto=format&fit=crop&q=80', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', 2023, 140, 'PG-13', 'English', 'New Zealand', FALSE, TRUE),
('m-silicon-dreams', 'Silicon Dreams', 'silicon-dreams', 'The dramatic story of a garage startup in 1997 that pioneered artificial consciousness.', 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1920&auto=format&fit=crop&q=80', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', 2025, 102, 'PG-13', 'English', 'United States', FALSE, TRUE),
('m-the-silent-abyss', 'The Silent Abyss', 'the-silent-abyss', 'Ten thousand meters under the Pacific Ocean, a deep-sea research station pierces a prehistoric chamber.', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&auto=format&fit=crop&q=80', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 2024, 98, 'R', 'English', 'Japan', FALSE, TRUE),
('m-velocity-drift', 'Velocity Drift', 'velocity-drift', 'An underground hyper-car racer in Tokyo is blackmailed into executing high-speed getaway heists.', 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920&auto=format&fit=crop&q=80', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', 2025, 112, 'PG-13', 'English', 'Japan', FALSE, TRUE),
('m-stellar-odyssey', 'Stellar Odyssey', 'stellar-odyssey', 'Humanitys first generation ship encounters a derelict alien megastructure drifting along the Kuiper belt.', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&auto=format&fit=crop&q=80', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 2024, 145, 'PG-13', 'English', 'United States', TRUE, TRUE)
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Movie Genres
INSERT INTO movie_genres (movie_id, genre_id) VALUES
('m-midnight-horizon', 'g-scifi'),
('m-midnight-horizon', 'g-action'),
('m-the-last-signal', 'g-scifi'),
('m-the-last-signal', 'g-mystery'),
('m-neon-summer', 'g-crime'),
('m-neon-summer', 'g-mystery'),
('m-beyond-the-island', 'g-action'),
('m-beyond-the-island', 'g-fantasy'),
('m-echoes-of-tomorrow', 'g-scifi'),
('m-the-forgotten-road', 'g-crime'),
('m-the-forgotten-road', 'g-mystery'),
('m-shadow-protocol', 'g-action'),
('m-shadow-protocol', 'g-crime'),
('m-crimson-skies', 'g-fantasy'),
('m-silicon-dreams', 'g-drama'),
('m-silicon-dreams', 'g-documentary'),
('m-the-silent-abyss', 'g-horror'),
('m-the-silent-abyss', 'g-scifi'),
('m-velocity-drift', 'g-action'),
('m-stellar-odyssey', 'g-scifi')
ON CONFLICT DO NOTHING;

-- 5. Insert Series
INSERT INTO series (id, title, slug, description, poster_url, backdrop_url, trailer_url, release_year, rating, language, country, is_featured, is_published) VALUES
('s-chrono-city', 'Chrono City', 'chrono-city', 'In a sprawling metropolis divided into distinct chronological sectors, a temporal detective investigates cross-century crimes.', 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1920&auto=format&fit=crop&q=80', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', 2024, 'TV-MA', 'English', 'United States', TRUE, TRUE),
('s-quantum-drift', 'Quantum Drift', 'quantum-drift', 'An underground team of theoretical hackers build a bridge to parallel universes.', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1920&auto=format&fit=crop&q=80', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', 2024, 'TV-MA', 'English', 'Germany', TRUE, TRUE),
('s-whispering-pines', 'Whispering Pines', 'whispering-pines', 'When a teenager vanishes into the mist of a Pacific Northwest town, the sheriff uncovers ancient forest secrets.', 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&auto=format&fit=crop&q=80', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 2024, 'TV-MA', 'English', 'United States', FALSE, TRUE),
('s-iron-vanguard', 'Iron Vanguard', 'iron-vanguard', 'A mechanized heavy armor squad defends the frontier colonies of Mars.', 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1920&auto=format&fit=crop&q=80', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', 2025, 'TV-14', 'English', 'United States', FALSE, TRUE),
('s-cybernetic-dawn', 'Cybernetic Dawn', 'cybernetic-dawn', 'In 2099 Neo-Seoul, a street bio-hacker builds black-market neural patches to liberate lower-tier outcasts.', 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1920&auto=format&fit=crop&q=80', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', 2025, 'TV-MA', 'Korean / English', 'South Korea', TRUE, TRUE),
('s-alchemist-legacy', 'The Alchemists Legacy', 'the-alchemists-legacy', 'In an alternate renaissance empire powered by alchemical steam, an apprentice discovers the formula for transmutation.', 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&auto=format&fit=crop&q=80', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 2024, 'TV-14', 'English', 'United Kingdom', FALSE, TRUE)
ON CONFLICT (id) DO NOTHING;

-- 6. Insert Series Genres
INSERT INTO series_genres (series_id, genre_id) VALUES
('s-chrono-city', 'g-scifi'),
('s-chrono-city', 'g-mystery'),
('s-quantum-drift', 'g-scifi'),
('s-whispering-pines', 'g-mystery'),
('s-whispering-pines', 'g-horror'),
('s-iron-vanguard', 'g-action'),
('s-iron-vanguard', 'g-scifi'),
('s-cybernetic-dawn', 'g-scifi'),
('s-cybernetic-dawn', 'g-crime'),
('s-alchemist-legacy', 'g-fantasy')
ON CONFLICT DO NOTHING;

-- 7. Insert Seasons & Episodes
INSERT INTO seasons (id, series_id, season_number, title) VALUES
('sea-chrono-s1', 's-chrono-city', 1, 'Season 1: Fractured Hours'),
('sea-chrono-s2', 's-chrono-city', 2, 'Season 2: Continuum Drift'),
('sea-quantum-s1', 's-quantum-drift', 1, 'Season 1: Dimension Zero'),
('sea-pines-s1', 's-whispering-pines', 1, 'Season 1: Deep Roots'),
('sea-iron-s1', 's-iron-vanguard', 1, 'Season 1: Red Dust'),
('sea-cyber-s1', 's-cybernetic-dawn', 1, 'Season 1: Protocol Zero'),
('sea-alch-s1', 's-alchemist-legacy', 1, 'Season 1: The Philosophers Ash')
ON CONFLICT (id) DO NOTHING;

INSERT INTO episodes (id, season_id, title, description, episode_number, duration, thumbnail_url, video_url, release_date) VALUES
('ep-chrono-s1e1', 'sea-chrono-s1', 'The Zero Hour', 'Detective Marcus Vance investigates the impossible murder of a senator.', 1, 52, 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400&auto=format&fit=crop&q=80', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', '2024-03-01'),
('ep-chrono-s1e2', 'sea-chrono-s1', 'Echoes in the Rain', 'A lead takes Vance to Sector 1940 where forbidden algorithms are transmitted.', 2, 48, 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400&auto=format&fit=crop&q=80', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', '2024-03-08'),
('ep-chrono-s1e3', 'sea-chrono-s1', 'The Grand Clocktower', 'A temporal distortion wave forces rival factions into a ceasefire.', 3, 55, 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&auto=format&fit=crop&q=80', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', '2024-03-15'),
('ep-chrono-s1e4', 'sea-chrono-s1', 'Paradox Protocol', 'Vance encounters an alternate version of his partner.', 4, 50, 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&auto=format&fit=crop&q=80', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', '2024-03-22'),
('ep-chrono-s1e5', 'sea-chrono-s1', 'The Collapse of 2150', 'The architect behind the time fractures is revealed atop Chrono One.', 5, 60, 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&auto=format&fit=crop&q=80', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', '2024-03-29'),
('ep-quantum-s1e1', 'sea-quantum-s1', 'First Jump', 'Dr. Elena Vance activates the Drift Core.', 1, 47, 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&auto=format&fit=crop&q=80', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', '2024-04-05'),
('ep-quantum-s1e2', 'sea-quantum-s1', 'The Mirror City', 'Trapped on an Earth ruled by AI, the crew scavenges rare isotopes.', 2, 51, 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&auto=format&fit=crop&q=80', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', '2024-04-12'),
('ep-pines-s1e1', 'sea-pines-s1', 'Fog on the Ridge', 'Sheriff Cole investigates a bicycle found in an ancient circle.', 1, 50, 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&auto=format&fit=crop&q=80', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', '2024-09-06'),
('ep-pines-s1e2', 'sea-pines-s1', 'Voices Beneath the Lake', 'The power grid fails as frequencies resonate through lake beds.', 2, 48, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&auto=format&fit=crop&q=80', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', '2024-09-13'),
('ep-iron-s1e1', 'sea-iron-s1', 'Siege of Sector 4', 'Commander Thorne drops into Olympus Mons.', 1, 44, 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&auto=format&fit=crop&q=80', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', '2025-02-01'),
('ep-cyber-s1e1', 'sea-cyber-s1', 'Synapse Overload', 'Min-ho hacks a neural chip to save a street kid.', 1, 52, 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=400&auto=format&fit=crop&q=80', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', '2025-01-05')
ON CONFLICT (id) DO NOTHING;
