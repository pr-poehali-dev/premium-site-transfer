"""
API для управления маршрутами и тарифами трансфера
"""
import json
import os
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
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        if method == 'GET':
            return get_routes(event)
        elif method == 'POST':
            return create_route(event)
        elif method == 'PUT':
            return update_route(event)
        elif method == 'DELETE':
            return delete_route(event)
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

def get_routes(event: dict) -> dict:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    query_params = event.get('queryStringParameters') or {}
    from_loc = query_params.get('from')
    to_loc = query_params.get('to')
    
    if from_loc and to_loc:
        cur.execute("""
            SELECT * FROM routes
            WHERE from_location = %s AND to_location = %s AND active = true
        """, (from_loc, to_loc))
    elif query_params.get('all') == 'true':
        cur.execute("SELECT * FROM routes ORDER BY from_location, to_location")
    else:
        cur.execute("SELECT * FROM routes WHERE active = true ORDER BY from_location, to_location")
    
    routes = cur.fetchall()
    cur.close()
    conn.close()
    
    routes_list = []
    for route in routes:
        route_dict = dict(route)
        if route_dict.get('base_price'):
            route_dict['base_price'] = float(route_dict['base_price'])
        if route_dict.get('created_at'):
            route_dict['created_at'] = route_dict['created_at'].isoformat()
        if route_dict.get('updated_at'):
            route_dict['updated_at'] = route_dict['updated_at'].isoformat()
        routes_list.append(route_dict)
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'routes': routes_list}),
        'isBase64Encoded': False
    }

def create_route(event: dict) -> dict:
    data = json.loads(event.get('body', '{}'))
    
    required_fields = ['from_location', 'to_location', 'base_price']
    for field in required_fields:
        if field not in data:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': f'Missing required field: {field}'}),
                'isBase64Encoded': False
            }
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("""
        INSERT INTO routes (from_location, to_location, base_price, distance_km, duration_minutes, active)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING id
    """, (
        data['from_location'],
        data['to_location'],
        data['base_price'],
        data.get('distance_km'),
        data.get('duration_minutes'),
        data.get('active', True)
    ))
    
    result = cur.fetchone()
    route_id = result['id']
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 201,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'id': route_id}),
        'isBase64Encoded': False
    }

def update_route(event: dict) -> dict:
    data = json.loads(event.get('body', '{}'))
    route_id = data.get('id')
    
    if not route_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Missing route id'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    update_fields = []
    values = []
    
    for field in ['from_location', 'to_location', 'base_price', 'distance_km', 'duration_minutes', 'active']:
        if field in data:
            update_fields.append(f'{field} = %s')
            values.append(data[field])
    
    if not update_fields:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'No fields to update'}),
            'isBase64Encoded': False
        }
    
    update_fields.append('updated_at = CURRENT_TIMESTAMP')
    values.append(route_id)
    
    query = f"UPDATE routes SET {', '.join(update_fields)} WHERE id = %s"
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

def delete_route(event: dict) -> dict:
    query_params = event.get('queryStringParameters') or {}
    route_id = query_params.get('id')
    
    if not route_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Missing route id'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("UPDATE routes SET active = false WHERE id = %s", (route_id,))
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True}),
        'isBase64Encoded': False
    }
