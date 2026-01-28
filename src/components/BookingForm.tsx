import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const API_URLS = {
  routes: 'https://functions.poehali.dev/4927a085-79df-4c62-9778-48f638e0d87a',
  bookings: 'https://functions.poehali.dev/cbaf73a6-2060-4d96-b79f-b90285c842ed',
  fleet: 'https://functions.poehali.dev/2e4efa94-1c37-4f70-9e50-f3215e11e584',
};

interface Route {
  id: number;
  from_location: string;
  to_location: string;
  base_price: number;
}

interface FleetItem {
  id: number;
  name: string;
  category: string;
  price_multiplier: number;
}

export default function BookingForm() {
  const { toast } = useToast();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [fleet, setFleet] = useState<FleetItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    from_location: '',
    to_location: '',
    pickup_date: '',
    pickup_time: '',
    flight_number: '',
    passengers: 1,
    fleet_id: '',
  });

  useEffect(() => {
    fetchRoutes();
    fetchFleet();
  }, []);

  useEffect(() => {
    if (formData.from_location && formData.to_location && formData.fleet_id) {
      calculatePrice();
    }
  }, [formData.from_location, formData.to_location, formData.fleet_id]);

  const fetchRoutes = async () => {
    try {
      const response = await fetch(API_URLS.routes);
      const data = await response.json();
      setRoutes(data.routes || []);
    } catch (error) {
      console.error('Failed to fetch routes:', error);
    }
  };

  const fetchFleet = async () => {
    try {
      const response = await fetch(API_URLS.fleet);
      const data = await response.json();
      setFleet(data.fleet || []);
    } catch (error) {
      console.error('Failed to fetch fleet:', error);
    }
  };

  const calculatePrice = () => {
    const route = routes.find(
      (r) => r.from_location === formData.from_location && r.to_location === formData.to_location
    );
    const vehicle = fleet.find((f) => f.id === parseInt(formData.fleet_id));

    if (route && vehicle) {
      const price = route.base_price * vehicle.price_multiplier;
      setCalculatedPrice(price);
    } else {
      setCalculatedPrice(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(API_URLS.bookings, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          fleet_id: formData.fleet_id ? parseInt(formData.fleet_id) : null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Заявка отправлена!',
          description: `Ваша заявка #${data.booking_id} принята. Стоимость: ${data.total_price} ₽`,
        });
        
        setFormData({
          customer_name: '',
          customer_phone: '',
          customer_email: '',
          from_location: '',
          to_location: '',
          pickup_date: '',
          pickup_time: '',
          flight_number: '',
          passengers: 1,
          fleet_id: '',
        });
        setCalculatedPrice(null);
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось отправить заявку',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось связаться с сервером',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const uniqueFromLocations = Array.from(new Set(routes.map((r) => r.from_location)));
  const availableToLocations = routes
    .filter((r) => r.from_location === formData.from_location)
    .map((r) => r.to_location);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="from" className="text-white mb-2 block">
          Откуда
        </Label>
        <Select value={formData.from_location} onValueChange={(value) => setFormData({ ...formData, from_location: value, to_location: '' })}>
          <SelectTrigger className="bg-white/20 border-gold/30 text-white">
            <SelectValue placeholder="Выберите точку отправления" />
          </SelectTrigger>
          <SelectContent>
            {uniqueFromLocations.map((location) => (
              <SelectItem key={location} value={location}>
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="to" className="text-white mb-2 block">
          Куда
        </Label>
        <Select
          value={formData.to_location}
          onValueChange={(value) => setFormData({ ...formData, to_location: value })}
          disabled={!formData.from_location}
        >
          <SelectTrigger className="bg-white/20 border-gold/30 text-white">
            <SelectValue placeholder="Выберите точку назначения" />
          </SelectTrigger>
          <SelectContent>
            {availableToLocations.map((location) => (
              <SelectItem key={location} value={location}>
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="fleet" className="text-white mb-2 block">
          Выберите автомобиль
        </Label>
        <Select value={formData.fleet_id} onValueChange={(value) => setFormData({ ...formData, fleet_id: value })}>
          <SelectTrigger className="bg-white/20 border-gold/30 text-white">
            <SelectValue placeholder="Выберите класс автомобиля" />
          </SelectTrigger>
          <SelectContent>
            {fleet.map((vehicle) => (
              <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                {vehicle.name} ({vehicle.category})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {calculatedPrice && (
        <div className="bg-gold/20 border border-gold/50 rounded-lg p-4 text-center">
          <div className="text-white text-sm mb-1">Примерная стоимость</div>
          <div className="text-gold text-3xl font-bold">{calculatedPrice.toFixed(0)} ₽</div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date" className="text-white mb-2 block">
            Дата
          </Label>
          <Input
            id="date"
            type="date"
            value={formData.pickup_date}
            onChange={(e) => setFormData({ ...formData, pickup_date: e.target.value })}
            className="bg-white/20 border-gold/30 text-white"
            required
          />
        </div>
        <div>
          <Label htmlFor="time" className="text-white mb-2 block">
            Время
          </Label>
          <Input
            id="time"
            type="time"
            value={formData.pickup_time}
            onChange={(e) => setFormData({ ...formData, pickup_time: e.target.value })}
            className="bg-white/20 border-gold/30 text-white"
            required
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
          value={formData.flight_number}
          onChange={(e) => setFormData({ ...formData, flight_number: e.target.value })}
          className="bg-white/20 border-gold/30 text-white placeholder:text-gray-400"
        />
      </div>

      <div>
        <Label htmlFor="name" className="text-white mb-2 block">
          Ваше имя
        </Label>
        <Input
          id="name"
          placeholder="Иван Иванов"
          value={formData.customer_name}
          onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
          className="bg-white/20 border-gold/30 text-white placeholder:text-gray-400"
          required
        />
      </div>

      <div>
        <Label htmlFor="phone" className="text-white mb-2 block">
          Телефон
        </Label>
        <Input
          id="phone"
          placeholder="+7 (900) 123-45-67"
          value={formData.customer_phone}
          onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
          className="bg-white/20 border-gold/30 text-white placeholder:text-gray-400"
          required
        />
      </div>

      <div>
        <Label htmlFor="email" className="text-white mb-2 block">
          Email (опционально)
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="your@email.com"
          value={formData.customer_email}
          onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
          className="bg-white/20 border-gold/30 text-white placeholder:text-gray-400"
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-gold hover:bg-gold/90 text-[#1A1F2C] font-semibold text-lg"
        disabled={loading}
      >
        {loading ? 'Отправка...' : 'Забронировать трансфер'}
      </Button>
    </form>
  );
}
