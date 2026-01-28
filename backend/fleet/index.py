"""
API для управления автопарком с возможностью загрузки фотографий
"""
import json
import os
import base64
import uuid
import psycopg2
from psycopg2.extras import RealDictCursor
import boto3

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def get_s3_client():
    return boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
    )

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
            return get_fleet(event)
        elif method == 'POST':
            return create_fleet_item(event)
        elif method == 'PUT':
            return update_fleet_item(event)
        elif method == 'DELETE':
            return delete_fleet_item(event)
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

def get_fleet(event: dict) -> dict:
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    query_params = event.get('queryStringParameters') or {}
    
    if query_params.get('all') == 'true':
        cur.execute("SELECT * FROM fleet ORDER BY category, name")
    else:
        cur.execute("SELECT * FROM fleet WHERE active = true ORDER BY category, name")
    
    fleet_items = cur.fetchall()
    cur.close()
    conn.close()
    
    fleet_list = []
    for item in fleet_items:
        item_dict = dict(item)
        if item_dict.get('price_multiplier'):
            item_dict['price_multiplier'] = float(item_dict['price_multiplier'])
        if item_dict.get('created_at'):
            item_dict['created_at'] = item_dict['created_at'].isoformat()
        if item_dict.get('updated_at'):
            item_dict['updated_at'] = item_dict['updated_at'].isoformat()
        fleet_list.append(item_dict)
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'fleet': fleet_list}),
        'isBase64Encoded': False
    }

def create_fleet_item(event: dict) -> dict:
    data = json.loads(event.get('body', '{}'))
    
    required_fields = ['name', 'category', 'seats']
    for field in required_fields:
        if field not in data:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': f'Missing required field: {field}'}),
                'isBase64Encoded': False
            }
    
    image_url = None
    if data.get('image_base64'):
        try:
            image_url = upload_image_to_s3(data['image_base64'], data.get('image_type', 'image/jpeg'))
        except Exception as e:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': f'Failed to upload image: {str(e)}'}),
                'isBase64Encoded': False
            }
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    features = data.get('features', [])
    
    cur.execute("""
        INSERT INTO fleet (name, category, seats, features, price_multiplier, image_url, active)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        RETURNING id
    """, (
        data['name'],
        data['category'],
        data['seats'],
        features,
        data.get('price_multiplier', 1.0),
        image_url,
        data.get('active', True)
    ))
    
    result = cur.fetchone()
    fleet_id = result['id']
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 201,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'id': fleet_id, 'image_url': image_url}),
        'isBase64Encoded': False
    }

def update_fleet_item(event: dict) -> dict:
    data = json.loads(event.get('body', '{}'))
    fleet_id = data.get('id')
    
    if not fleet_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Missing fleet id'}),
            'isBase64Encoded': False
        }
    
    image_url = None
    if data.get('image_base64'):
        try:
            image_url = upload_image_to_s3(data['image_base64'], data.get('image_type', 'image/jpeg'))
        except Exception as e:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': f'Failed to upload image: {str(e)}'}),
                'isBase64Encoded': False
            }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    update_fields = []
    values = []
    
    for field in ['name', 'category', 'seats', 'features', 'price_multiplier', 'active']:
        if field in data:
            update_fields.append(f'{field} = %s')
            values.append(data[field])
    
    if image_url:
        update_fields.append('image_url = %s')
        values.append(image_url)
    
    if not update_fields:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'No fields to update'}),
            'isBase64Encoded': False
        }
    
    update_fields.append('updated_at = CURRENT_TIMESTAMP')
    values.append(fleet_id)
    
    query = f"UPDATE fleet SET {', '.join(update_fields)} WHERE id = %s"
    cur.execute(query, values)
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'image_url': image_url}),
        'isBase64Encoded': False
    }

def delete_fleet_item(event: dict) -> dict:
    query_params = event.get('queryStringParameters') or {}
    fleet_id = query_params.get('id')
    
    if not fleet_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Missing fleet id'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("UPDATE fleet SET active = false WHERE id = %s", (fleet_id,))
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True}),
        'isBase64Encoded': False
    }

def upload_image_to_s3(base64_data: str, content_type: str) -> str:
    s3 = get_s3_client()
    
    image_data = base64.b64decode(base64_data)
    
    file_extension = content_type.split('/')[-1]
    if file_extension == 'jpeg':
        file_extension = 'jpg'
    
    file_name = f"fleet/{uuid.uuid4()}.{file_extension}"
    
    s3.put_object(
        Bucket='files',
        Key=file_name,
        Body=image_data,
        ContentType=content_type
    )
    
    cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{file_name}"
    
    return cdn_url
