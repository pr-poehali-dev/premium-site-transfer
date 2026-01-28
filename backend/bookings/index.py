"""
API для работы с бронированием трансфера: расчёт цен, создание заявок, получение списка заявок
"""
import json
import os
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: dict, context) -> dict:
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        if method == 'GET':
            return get_bookings(event)
        elif method == 'POST':
            return create_booking(event)
        elif method == 'PUT':
            return update_booking(event)
        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }

def get_bookings(event: dict) -> dict:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    query_params = event.get('queryStringParameters') or {}
    status_filter = query_params.get('status')
    
    if status_filter:
        cur.execute("""
            SELECT b.*, f.name as fleet_name, f.category as fleet_category,
                   r.from_location, r.to_location, r.base_price
            FROM bookings b
            LEFT JOIN fleet f ON b.fleet_id = f.id
            LEFT JOIN routes r ON b.route_id = r.id
            WHERE b.status = %s
            ORDER BY b.created_at DESC
        """, (status_filter,))
    else:
        cur.execute("""
            SELECT b.*, f.name as fleet_name, f.category as fleet_category,
                   r.from_location, r.to_location, r.base_price
            FROM bookings b
            LEFT JOIN fleet f ON b.fleet_id = f.id
            LEFT JOIN routes r ON b.route_id = r.id
            ORDER BY b.created_at DESC
        """)
    
    bookings = cur.fetchall()
    cur.close()
    conn.close()
    
    bookings_list = []
    for booking in bookings:
        booking_dict = dict(booking)
        if booking_dict.get('pickup_date'):
            booking_dict['pickup_date'] = booking_dict['pickup_date'].isoformat()
        if booking_dict.get('pickup_time'):
            booking_dict['pickup_time'] = str(booking_dict['pickup_time'])
        if booking_dict.get('created_at'):
            booking_dict['created_at'] = booking_dict['created_at'].isoformat()
        if booking_dict.get('updated_at'):
            booking_dict['updated_at'] = booking_dict['updated_at'].isoformat()
        if booking_dict.get('total_price'):
            booking_dict['total_price'] = float(booking_dict['total_price'])
        if booking_dict.get('base_price'):
            booking_dict['base_price'] = float(booking_dict['base_price'])
        bookings_list.append(booking_dict)
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'bookings': bookings_list}),
        'isBase64Encoded': False
    }

def create_booking(event: dict) -> dict:
    data = json.loads(event.get('body', '{}'))
    
    required_fields = ['customer_name', 'customer_phone', 'from_location', 'to_location', 'pickup_date', 'pickup_time']
    for field in required_fields:
        if not data.get(field):
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': f'Missing required field: {field}'}),
                'isBase64Encoded': False
            }
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("""
        SELECT id, base_price FROM routes
        WHERE from_location = %s AND to_location = %s AND active = true
        LIMIT 1
    """, (data['from_location'], data['to_location']))
    route = cur.fetchone()
    
    route_id = None
    base_price = 0
    if route:
        route_id = route['id']
        base_price = float(route['base_price'])
    
    fleet_id = data.get('fleet_id')
    price_multiplier = 1.0
    
    if fleet_id:
        cur.execute("""
            SELECT price_multiplier FROM fleet WHERE id = %s AND active = true
        """, (fleet_id,))
        fleet_data = cur.fetchone()
        if fleet_data:
            price_multiplier = float(fleet_data['price_multiplier'])
    
    total_price = base_price * price_multiplier
    
    cur.execute("""
        INSERT INTO bookings 
        (customer_name, customer_phone, customer_email, from_location, to_location,
         pickup_date, pickup_time, flight_number, passengers, fleet_id, route_id,
         total_price, status, notes)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id, created_at
    """, (
        data['customer_name'],
        data['customer_phone'],
        data.get('customer_email'),
        data['from_location'],
        data['to_location'],
        data['pickup_date'],
        data['pickup_time'],
        data.get('flight_number'),
        data.get('passengers', 1),
        fleet_id,
        route_id,
        total_price,
        'pending',
        data.get('notes')
    ))
    
    result = cur.fetchone()
    booking_id = result['id']
    created_at = result['created_at'].isoformat()
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 201,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'success': True,
            'booking_id': booking_id,
            'total_price': total_price,
            'created_at': created_at
        }),
        'isBase64Encoded': False
    }

def update_booking(event: dict) -> dict:
    data = json.loads(event.get('body', '{}'))
    booking_id = data.get('id')
    
    if not booking_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Missing booking id'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    update_fields = []
    values = []
    
    if 'status' in data:
        update_fields.append('status = %s')
        values.append(data['status'])
    
    if 'notes' in data:
        update_fields.append('notes = %s')
        values.append(data['notes'])
    
    if not update_fields:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'No fields to update'}),
            'isBase64Encoded': False
        }
    
    update_fields.append('updated_at = CURRENT_TIMESTAMP')
    values.append(booking_id)
    
    query = f"UPDATE bookings SET {', '.join(update_fields)} WHERE id = %s"
    cur.execute(query, values)
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True}),
        'isBase64Encoded': False
    }
