-- Таблица маршрутов и цен
CREATE TABLE IF NOT EXISTS routes (
    id SERIAL PRIMARY KEY,
    from_location VARCHAR(255) NOT NULL,
    to_location VARCHAR(255) NOT NULL,
    base_price DECIMAL(10, 2) NOT NULL,
    distance_km INTEGER,
    duration_minutes INTEGER,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица автопарка
CREATE TABLE IF NOT EXISTS fleet (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    seats INTEGER NOT NULL,
    features TEXT[] DEFAULT '{}',
    price_multiplier DECIMAL(3, 2) DEFAULT 1.0,
    image_url TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица заявок на трансфер
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_email VARCHAR(255),
    from_location VARCHAR(255) NOT NULL,
    to_location VARCHAR(255) NOT NULL,
    pickup_date DATE NOT NULL,
    pickup_time TIME NOT NULL,
    flight_number VARCHAR(50),
    passengers INTEGER DEFAULT 1,
    fleet_id INTEGER REFERENCES fleet(id),
    route_id INTEGER REFERENCES routes(id),
    total_price DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица администраторов
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(pickup_date);
CREATE INDEX IF NOT EXISTS idx_routes_locations ON routes(from_location, to_location);
CREATE INDEX IF NOT EXISTS idx_fleet_active ON fleet(active);

-- Вставка начальных данных маршрутов
INSERT INTO routes (from_location, to_location, base_price, distance_km, duration_minutes) VALUES
('Аэропорт Адлер', 'Гагра', 3500, 45, 60),
('Аэропорт Адлер', 'Пицунда', 4000, 65, 90),
('Аэропорт Адлер', 'Гудаута', 4500, 75, 100),
('Аэропорт Адлер', 'Новый Афон', 4800, 85, 110),
('Аэропорт Адлер', 'Сухум', 5500, 110, 140),
('Аэропорт Адлер', 'Сочи Центр', 1500, 25, 35),
('Аэропорт Адлер', 'Красная Поляна', 2500, 45, 55),
('Сочи Центр', 'Гагра', 3000, 55, 70),
('Сочи Центр', 'Красная Поляна', 2000, 40, 50);

-- Вставка начальных данных автопарка
INSERT INTO fleet (name, category, seats, features, price_multiplier) VALUES
('Mercedes-Benz E-Class', 'Бизнес', 3, ARRAY['Кожаный салон', 'Климат-контроль', 'Wi-Fi'], 1.0),
('Mercedes-Benz V-Class', 'Минивэн', 6, ARRAY['Просторный салон', 'Панорамная крыша', 'USB-порты'], 1.3),
('Mercedes-Benz S-Class', 'Премиум', 3, ARRAY['VIP-класс', 'Массаж сидений', 'Шампанское'], 1.8),
('Toyota Camry', 'Комфорт', 3, ARRAY['Комфортный салон', 'Кондиционер', 'Музыка'], 0.8);
