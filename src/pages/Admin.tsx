import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

const API_URLS = {
  routes: 'https://functions.poehali.dev/4927a085-79df-4c62-9778-48f638e0d87a',
  bookings: 'https://functions.poehali.dev/cbaf73a6-2060-4d96-b79f-b90285c842ed',
  fleet: 'https://functions.poehali.dev/2e4efa94-1c37-4f70-9e50-f3215e11e584',
};

interface Booking {
  id: number;
  customer_name: string;
  customer_phone: string;
  from_location: string;
  to_location: string;
  pickup_date: string;
  pickup_time: string;
  total_price: number;
  status: string;
  fleet_name?: string;
}

interface Route {
  id: number;
  from_location: string;
  to_location: string;
  base_price: number;
  distance_km?: number;
  duration_minutes?: number;
  active: boolean;
}

interface FleetItem {
  id: number;
  name: string;
  category: string;
  seats: number;
  features: string[];
  price_multiplier: number;
  image_url?: string;
  active: boolean;
}

export default function Admin() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [fleet, setFleet] = useState<FleetItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [newRoute, setNewRoute] = useState({
    from_location: '',
    to_location: '',
    base_price: '',
    distance_km: '',
    duration_minutes: '',
  });

  const [newFleet, setNewFleet] = useState({
    name: '',
    category: '',
    seats: '',
    features: '',
    price_multiplier: '1.0',
    image_base64: '',
  });

  useEffect(() => {
    fetchBookings();
    fetchRoutes();
    fetchFleet();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch(`${API_URLS.bookings}?all=true`);
      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    }
  };

  const fetchRoutes = async () => {
    try {
      const response = await fetch(`${API_URLS.routes}?all=true`);
      const data = await response.json();
      setRoutes(data.routes || []);
    } catch (error) {
      console.error('Failed to fetch routes:', error);
    }
  };

  const fetchFleet = async () => {
    try {
      const response = await fetch(`${API_URLS.fleet}?all=true`);
      const data = await response.json();
      setFleet(data.fleet || []);
    } catch (error) {
      console.error('Failed to fetch fleet:', error);
    }
  };

  const updateBookingStatus = async (bookingId: number, status: string) => {
    setLoading(true);
    try {
      const response = await fetch(API_URLS.bookings, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: bookingId, status }),
      });

      if (response.ok) {
        toast({ title: 'Статус обновлён', description: `Заявка #${bookingId} обновлена` });
        fetchBookings();
      } else {
        toast({ title: 'Ошибка', description: 'Не удалось обновить статус', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось связаться с сервером', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const createRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(API_URLS.routes, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newRoute,
          base_price: parseFloat(newRoute.base_price),
          distance_km: newRoute.distance_km ? parseInt(newRoute.distance_km) : null,
          duration_minutes: newRoute.duration_minutes ? parseInt(newRoute.duration_minutes) : null,
        }),
      });

      if (response.ok) {
        toast({ title: 'Маршрут добавлен', description: 'Новый маршрут успешно создан' });
        setNewRoute({ from_location: '', to_location: '', base_price: '', distance_km: '', duration_minutes: '' });
        fetchRoutes();
      } else {
        toast({ title: 'Ошибка', description: 'Не удалось создать маршрут', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось связаться с сервером', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const updateRoute = async (routeId: number, updates: Partial<Route>) => {
    setLoading(true);
    try {
      const response = await fetch(API_URLS.routes, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: routeId, ...updates }),
      });

      if (response.ok) {
        toast({ title: 'Маршрут обновлён' });
        fetchRoutes();
      } else {
        toast({ title: 'Ошибка', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result?.toString().split(',')[1];
        setNewFleet({ ...newFleet, image_base64: base64String || '' });
      };
      reader.readAsDataURL(file);
    }
  };

  const createFleet = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(API_URLS.fleet, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFleet.name,
          category: newFleet.category,
          seats: parseInt(newFleet.seats),
          features: newFleet.features.split(',').map((f) => f.trim()),
          price_multiplier: parseFloat(newFleet.price_multiplier),
          image_base64: newFleet.image_base64 || null,
          image_type: 'image/jpeg',
        }),
      });

      if (response.ok) {
        toast({ title: 'Автомобиль добавлен', description: 'Новый автомобиль успешно добавлен в автопарк' });
        setNewFleet({ name: '', category: '', seats: '', features: '', price_multiplier: '1.0', image_base64: '' });
        fetchFleet();
      } else {
        const data = await response.json();
        toast({ title: 'Ошибка', description: data.error || 'Не удалось добавить автомобиль', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось связаться с сервером', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const updateFleet = async (fleetId: number, updates: Partial<FleetItem>) => {
    setLoading(true);
    try {
      const response = await fetch(API_URLS.fleet, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: fleetId, ...updates }),
      });

      if (response.ok) {
        toast({ title: 'Автомобиль обновлён' });
        fetchFleet();
      } else {
        toast({ title: 'Ошибка', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      confirmed: 'default',
      completed: 'outline',
      cancelled: 'destructive',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1A1F2C] to-[#2d3748] py-8 px-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-montserrat font-bold text-white flex items-center gap-3">
            <Icon name="Settings" className="text-gold" size={40} />
            Админ-панель
          </h1>
          <Button onClick={() => window.location.href = '/'} variant="outline" className="border-gold text-gold">
            На главную
          </Button>
        </div>

        <Tabs defaultValue="bookings" className="w-full">
          <TabsList className="bg-white/10 border border-gold/30">
            <TabsTrigger value="bookings" className="data-[state=active]:bg-gold data-[state=active]:text-[#1A1F2C]">
              Заявки
            </TabsTrigger>
            <TabsTrigger value="routes" className="data-[state=active]:bg-gold data-[state=active]:text-[#1A1F2C]">
              Тарифы
            </TabsTrigger>
            <TabsTrigger value="fleet" className="data-[state=active]:bg-gold data-[state=active]:text-[#1A1F2C]">
              Автопарк
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            <Card className="bg-white/10 backdrop-blur-md border-gold/30">
              <CardHeader>
                <CardTitle className="text-white">Заявки на трансфер</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gold/30">
                      <TableHead className="text-gray-300">ID</TableHead>
                      <TableHead className="text-gray-300">Клиент</TableHead>
                      <TableHead className="text-gray-300">Маршрут</TableHead>
                      <TableHead className="text-gray-300">Дата/Время</TableHead>
                      <TableHead className="text-gray-300">Автомобиль</TableHead>
                      <TableHead className="text-gray-300">Цена</TableHead>
                      <TableHead className="text-gray-300">Статус</TableHead>
                      <TableHead className="text-gray-300">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id} className="border-gold/20">
                        <TableCell className="text-white">#{booking.id}</TableCell>
                        <TableCell className="text-white">
                          <div>{booking.customer_name}</div>
                          <div className="text-sm text-gray-400">{booking.customer_phone}</div>
                        </TableCell>
                        <TableCell className="text-white">
                          {booking.from_location} → {booking.to_location}
                        </TableCell>
                        <TableCell className="text-white">
                          {booking.pickup_date} {booking.pickup_time}
                        </TableCell>
                        <TableCell className="text-white">{booking.fleet_name || 'Не указан'}</TableCell>
                        <TableCell className="text-gold font-bold">{booking.total_price} ₽</TableCell>
                        <TableCell>{getStatusBadge(booking.status)}</TableCell>
                        <TableCell>
                          <Select
                            value={booking.status}
                            onValueChange={(value) => updateBookingStatus(booking.id, value)}
                          >
                            <SelectTrigger className="w-32 bg-white/20 border-gold/30 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="routes">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white/10 backdrop-blur-md border-gold/30">
                <CardHeader>
                  <CardTitle className="text-white">Добавить маршрут</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={createRoute} className="space-y-4">
                    <div>
                      <Label className="text-white">Откуда</Label>
                      <Input
                        value={newRoute.from_location}
                        onChange={(e) => setNewRoute({ ...newRoute, from_location: e.target.value })}
                        className="bg-white/20 border-gold/30 text-white"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-white">Куда</Label>
                      <Input
                        value={newRoute.to_location}
                        onChange={(e) => setNewRoute({ ...newRoute, to_location: e.target.value })}
                        className="bg-white/20 border-gold/30 text-white"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-white">Цена (₽)</Label>
                      <Input
                        type="number"
                        value={newRoute.base_price}
                        onChange={(e) => setNewRoute({ ...newRoute, base_price: e.target.value })}
                        className="bg-white/20 border-gold/30 text-white"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white">Расстояние (км)</Label>
                        <Input
                          type="number"
                          value={newRoute.distance_km}
                          onChange={(e) => setNewRoute({ ...newRoute, distance_km: e.target.value })}
                          className="bg-white/20 border-gold/30 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-white">Время (мин)</Label>
                        <Input
                          type="number"
                          value={newRoute.duration_minutes}
                          onChange={(e) => setNewRoute({ ...newRoute, duration_minutes: e.target.value })}
                          className="bg-white/20 border-gold/30 text-white"
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full bg-gold hover:bg-gold/90 text-[#1A1F2C]" disabled={loading}>
                      Добавить маршрут
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-gold/30">
                <CardHeader>
                  <CardTitle className="text-white">Список маршрутов</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
                  {routes.map((route) => (
                    <div key={route.id} className="bg-white/5 p-4 rounded-lg border border-gold/20">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-white font-semibold">
                          {route.from_location} → {route.to_location}
                        </div>
                        <Badge variant={route.active ? 'default' : 'secondary'}>
                          {route.active ? 'Активен' : 'Неактивен'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mb-2">
                        <Input
                          type="number"
                          defaultValue={route.base_price}
                          onBlur={(e) => updateRoute(route.id, { base_price: parseFloat(e.target.value) })}
                          className="w-32 bg-white/20 border-gold/30 text-white"
                        />
                        <span className="text-gray-400">₽</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateRoute(route.id, { active: !route.active })}
                          className="border-gold/50 text-white"
                        >
                          {route.active ? 'Деактивировать' : 'Активировать'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="fleet">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white/10 backdrop-blur-md border-gold/30">
                <CardHeader>
                  <CardTitle className="text-white">Добавить автомобиль</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={createFleet} className="space-y-4">
                    <div>
                      <Label className="text-white">Название</Label>
                      <Input
                        value={newFleet.name}
                        onChange={(e) => setNewFleet({ ...newFleet, name: e.target.value })}
                        className="bg-white/20 border-gold/30 text-white"
                        placeholder="Mercedes-Benz E-Class"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-white">Категория</Label>
                      <Input
                        value={newFleet.category}
                        onChange={(e) => setNewFleet({ ...newFleet, category: e.target.value })}
                        className="bg-white/20 border-gold/30 text-white"
                        placeholder="Бизнес"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white">Мест</Label>
                        <Input
                          type="number"
                          value={newFleet.seats}
                          onChange={(e) => setNewFleet({ ...newFleet, seats: e.target.value })}
                          className="bg-white/20 border-gold/30 text-white"
                          required
                        />
                      </div>
                      <div>
                        <Label className="text-white">Коэффициент цены</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={newFleet.price_multiplier}
                          onChange={(e) => setNewFleet({ ...newFleet, price_multiplier: e.target.value })}
                          className="bg-white/20 border-gold/30 text-white"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-white">Особенности (через запятую)</Label>
                      <Input
                        value={newFleet.features}
                        onChange={(e) => setNewFleet({ ...newFleet, features: e.target.value })}
                        className="bg-white/20 border-gold/30 text-white"
                        placeholder="Кожаный салон, Wi-Fi, Климат-контроль"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-white">Фото автомобиля</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="bg-white/20 border-gold/30 text-white"
                      />
                    </div>
                    <Button type="submit" className="w-full bg-gold hover:bg-gold/90 text-[#1A1F2C]" disabled={loading}>
                      Добавить автомобиль
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-gold/30">
                <CardHeader>
                  <CardTitle className="text-white">Автопарк</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
                  {fleet.map((vehicle) => (
                    <div key={vehicle.id} className="bg-white/5 p-4 rounded-lg border border-gold/20">
                      {vehicle.image_url && (
                        <img src={vehicle.image_url} alt={vehicle.name} className="w-full h-32 object-cover rounded mb-3" />
                      )}
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="text-white font-semibold">{vehicle.name}</div>
                          <div className="text-sm text-gray-400">{vehicle.category}</div>
                        </div>
                        <Badge variant={vehicle.active ? 'default' : 'secondary'}>
                          {vehicle.active ? 'Активен' : 'Неактивен'}
                        </Badge>
                      </div>
                      <div className="text-gray-300 text-sm mb-2">
                        Мест: {vehicle.seats} | Коэффициент: {vehicle.price_multiplier}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateFleet(vehicle.id, { active: !vehicle.active })}
                          className="border-gold/50 text-white"
                        >
                          {vehicle.active ? 'Деактивировать' : 'Активировать'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
