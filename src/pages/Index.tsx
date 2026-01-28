import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

const Index = () => {
  const [activeSection, setActiveSection] = useState('home');

  const services = [
    {
      title: 'Сочи — Абхазия',
      description: 'Комфортный трансфер до любого города Абхазии',
      price: 'от 3 500 ₽',
      cities: ['Гагра', 'Пицунда', 'Гудаута', 'Новый Афон', 'Сухум'],
    },
    {
      title: 'Трансфер из аэропорта',
      description: 'Встреча с табличкой, помощь с багажом',
      price: 'от 1 500 ₽',
      cities: ['Аэропорт Адлер', 'Аэропорт Сочи', 'Вокзал Адлер'],
    },
    {
      title: 'Экскурсии',
      description: 'Индивидуальные туры по Сочи и Абхазии',
      price: 'от 5 000 ₽',
      cities: ['Красная поляна', 'Олимпийский парк', 'Озеро Рица'],
    },
  ];

  const fleet = [
    {
      name: 'Mercedes-Benz E-Class',
      category: 'Бизнес',
      seats: '3 пассажира',
      features: ['Кожаный салон', 'Климат-контроль', 'Wi-Fi'],
    },
    {
      name: 'Mercedes-Benz V-Class',
      category: 'Минивэн',
      seats: '6 пассажиров',
      features: ['Просторный салон', 'Панорамная крыша', 'USB-порты'],
    },
    {
      name: 'Mercedes-Benz S-Class',
      category: 'Премиум',
      seats: '3 пассажира',
      features: ['VIP-класс', 'Массаж сидений', 'Шампанское'],
    },
  ];

  const scrollToSection = (section: string) => {
    setActiveSection(section);
    const element = document.getElementById(section);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1A1F2C] to-[#2d3748]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#1A1F2C]/95 backdrop-blur-sm border-b border-gold/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="Car" className="text-gold" size={32} />
            <span className="text-2xl font-montserrat font-bold text-white">
              LUX<span className="text-gold">Transfer</span>
            </span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            {['Главная', 'Услуги', 'Автопарк', 'О нас', 'Контакты'].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item.toLowerCase())}
                className="text-white hover:text-gold transition-colors duration-300 font-medium"
              >
                {item}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <a href="https://wa.me/79001234567" className="text-white hover:text-gold transition-colors">
              <Icon name="MessageCircle" size={24} />
            </a>
            <a href="https://instagram.com" className="text-white hover:text-gold transition-colors">
              <Icon name="Instagram" size={24} />
            </a>
            <Button className="bg-gold hover:bg-gold/90 text-[#1A1F2C] font-semibold">
              +7 (900) 123-45-67
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="главная" className="pt-32 pb-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h1 className="text-5xl md:text-6xl font-montserrat font-bold text-white mb-6 leading-tight">
                Премиальный трансфер в <span className="text-gold">Сочи</span> и{' '}
                <span className="text-gold">Абхазии</span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Комфортабельные автомобили бизнес и премиум-класса. Встреча с табличкой в
                аэропорту. Профессиональные водители с опытом более 10 лет.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="bg-gold hover:bg-gold/90 text-[#1A1F2C] font-semibold text-lg px-8"
                  onClick={() => scrollToSection('контакты')}
                >
                  Заказать трансфер
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-gold text-gold hover:bg-gold hover:text-[#1A1F2C] font-semibold text-lg px-8"
                  onClick={() => scrollToSection('автопарк')}
                >
                  Наш автопарк
                </Button>
              </div>
            </div>

            <Card className="bg-white/10 backdrop-blur-md border-gold/30 animate-slide-up">
              <CardContent className="p-8">
                <h3 className="text-2xl font-montserrat font-bold text-white mb-6">
                  Быстрое бронирование
                </h3>
                <form className="space-y-4">
                  <div>
                    <Label htmlFor="from" className="text-white mb-2 block">
                      Откуда
                    </Label>
                    <Input
                      id="from"
                      placeholder="Аэропорт Адлер"
                      className="bg-white/20 border-gold/30 text-white placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <Label htmlFor="to" className="text-white mb-2 block">
                      Куда
                    </Label>
                    <Input
                      id="to"
                      placeholder="Гагра, Абхазия"
                      className="bg-white/20 border-gold/30 text-white placeholder:text-gray-400"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date" className="text-white mb-2 block">
                        Дата
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        className="bg-white/20 border-gold/30 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="time" className="text-white mb-2 block">
                        Время
                      </Label>
                      <Input
                        id="time"
                        type="time"
                        className="bg-white/20 border-gold/30 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="flight" className="text-white mb-2 block">
                      Номер рейса (опционально)
                    </Label>
                    <Input
                      id="flight"
                      placeholder="SU 1234"
                      className="bg-white/20 border-gold/30 text-white placeholder:text-gray-400"
                    />
                  </div>
                  <Button className="w-full bg-gold hover:bg-gold/90 text-[#1A1F2C] font-semibold text-lg">
                    Рассчитать стоимость
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="услуги" className="py-20 px-4 bg-white/5">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-montserrat font-bold text-center text-white mb-4">
            Наши услуги
          </h2>
          <p className="text-center text-gray-300 text-lg mb-12 max-w-2xl mx-auto">
            Предлагаем комфортный трансфер по самым популярным направлениям
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card
                key={index}
                className="bg-white/10 backdrop-blur-md border-gold/30 hover-lift animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mb-6">
                    <Icon name="MapPin" className="text-gold" size={32} />
                  </div>
                  <h3 className="text-2xl font-montserrat font-bold text-white mb-3">
                    {service.title}
                  </h3>
                  <p className="text-gray-300 mb-4">{service.description}</p>
                  <div className="text-3xl font-bold text-gold mb-4">{service.price}</div>
                  <div className="space-y-2 mb-6">
                    {service.cities.map((city, i) => (
                      <div key={i} className="flex items-center gap-2 text-gray-300">
                        <Icon name="Check" className="text-gold" size={18} />
                        <span>{city}</span>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full bg-gold hover:bg-gold/90 text-[#1A1F2C] font-semibold">
                    Заказать
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Fleet */}
      <section id="автопарк" className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-montserrat font-bold text-center text-white mb-4">
            Наш автопарк
          </h2>
          <p className="text-center text-gray-300 text-lg mb-12 max-w-2xl mx-auto">
            Премиальные автомобили Mercedes-Benz в идеальном состоянии
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {fleet.map((car, index) => (
              <Card
                key={index}
                className="bg-white/10 backdrop-blur-md border-gold/30 overflow-hidden hover-lift animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="h-48 bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center">
                  <Icon name="Car" className="text-gold" size={80} />
                </div>
                <CardContent className="p-6">
                  <div className="text-sm text-gold font-semibold mb-2">{car.category}</div>
                  <h3 className="text-2xl font-montserrat font-bold text-white mb-2">
                    {car.name}
                  </h3>
                  <div className="flex items-center gap-2 text-gray-300 mb-4">
                    <Icon name="Users" size={18} />
                    <span>{car.seats}</span>
                  </div>
                  <div className="space-y-2">
                    {car.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-gray-300">
                        <Icon name="Check" className="text-gold" size={18} />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="о нас" className="py-20 px-4 bg-white/5">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-montserrat font-bold text-center text-white mb-12">
            О нас
          </h2>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              { number: '10+', label: 'Лет на рынке' },
              { number: '5000+', label: 'Довольных клиентов' },
              { number: '24/7', label: 'Поддержка' },
            ].map((stat, index) => (
              <div
                key={index}
                className="text-center animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-5xl font-montserrat font-bold text-gold mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>
          <Card className="bg-white/10 backdrop-blur-md border-gold/30">
            <CardContent className="p-8 text-center">
              <p className="text-lg text-gray-300 leading-relaxed">
                <strong className="text-white">LUXTransfer</strong> — это премиальный сервис
                трансфера в Сочи и Абхазии. Мы работаем с 2014 года и за это время перевезли более
                5000 пассажиров. Наши водители — профессионалы с многолетним опытом, знающие все
                особенности дорог региона. Мы гарантируем комфорт, безопасность и пунктуальность.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact */}
      <section id="контакты" className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-montserrat font-bold text-center text-white mb-4">
            Связаться с нами
          </h2>
          <p className="text-center text-gray-300 text-lg mb-12">
            Оставьте заявку, и мы свяжемся с вами в течение 5 минут
          </p>

          <Card className="bg-white/10 backdrop-blur-md border-gold/30">
            <CardContent className="p-8">
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className="text-white mb-2 block">
                      Ваше имя
                    </Label>
                    <Input
                      id="name"
                      placeholder="Иван Иванов"
                      className="bg-white/20 border-gold/30 text-white placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-white mb-2 block">
                      Телефон
                    </Label>
                    <Input
                      id="phone"
                      placeholder="+7 (900) 123-45-67"
                      className="bg-white/20 border-gold/30 text-white placeholder:text-gray-400"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="message" className="text-white mb-2 block">
                    Сообщение
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Расскажите о ваших пожеланиях..."
                    rows={4}
                    className="bg-white/20 border-gold/30 text-white placeholder:text-gray-400"
                  />
                </div>
                <Button className="w-full bg-gold hover:bg-gold/90 text-[#1A1F2C] font-semibold text-lg">
                  Отправить заявку
                </Button>
              </form>

              <div className="mt-8 pt-8 border-t border-gold/30">
                <div className="grid md:grid-cols-3 gap-6 text-center">
                  <div>
                    <Icon name="Phone" className="text-gold mx-auto mb-2" size={24} />
                    <div className="text-white font-semibold">+7 (900) 123-45-67</div>
                  </div>
                  <div>
                    <Icon name="Mail" className="text-gold mx-auto mb-2" size={24} />
                    <div className="text-white font-semibold">info@luxtransfer.ru</div>
                  </div>
                  <div>
                    <Icon name="MapPin" className="text-gold mx-auto mb-2" size={24} />
                    <div className="text-white font-semibold">Сочи, Адлер</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1A1F2C] border-t border-gold/20 py-8 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Icon name="Car" className="text-gold" size={28} />
            <span className="text-xl font-montserrat font-bold text-white">
              LUX<span className="text-gold">Transfer</span>
            </span>
          </div>
          <p className="text-gray-400 mb-4">
            Премиальный трансфер в Сочи и Абхазии с 2014 года
          </p>
          <div className="flex items-center justify-center gap-6">
            <a href="https://wa.me/79001234567" className="text-gray-400 hover:text-gold transition-colors">
              <Icon name="MessageCircle" size={24} />
            </a>
            <a href="https://instagram.com" className="text-gray-400 hover:text-gold transition-colors">
              <Icon name="Instagram" size={24} />
            </a>
            <a href="tel:+79001234567" className="text-gray-400 hover:text-gold transition-colors">
              <Icon name="Phone" size={24} />
            </a>
            <a href="mailto:info@luxtransfer.ru" className="text-gray-400 hover:text-gold transition-colors">
              <Icon name="Mail" size={24} />
            </a>
          </div>
          <div className="mt-6 text-gray-500 text-sm">
            © 2024 LUXTransfer. Все права защищены.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
