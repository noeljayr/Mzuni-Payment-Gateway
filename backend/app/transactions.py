import uuid
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from dotenv import load_dotenv
import os
from base64 import b64decode
from pymongo import MongoClient
import random

load_dotenv('.env')


payments = {}

key = bytes.fromhex("")
iv = bytes.fromhex("")
client = MongoClient('')
db = client['mzunipay']
payments_collection = db['payments']

def decrypt(encrypted_text):
    if not isinstance(encrypted_text, str):
        raise TypeError("Encrypted text must be a string")
    
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
    decryptor = cipher.decryptor()

    decrypted_text = decryptor.update(bytes.fromhex(encrypted_text)) + decryptor.finalize()
    return decrypted_text.decode('utf-8').rstrip()

def process_payment(payment_details):
    # print(f"Encrypted amount: {payment_details['amount']}")
    # print(f"Encrypted currency: {payment_details['currency']}")
    # print(f"Encrypted customerId: {payment_details['customerId']}")
    
    try:
        decrypted_amount = decrypt(payment_details['amount'])
        decrypted_currency = decrypt(payment_details['currency'])
        decrypted_customer_id = decrypt(payment_details['customerId'])
        
    except Exception as e:
        print(f"Error during decryption: {e}")
        raise

    transaction_id = str(uuid.uuid4())
    payment_status =  random.choice(['success', 'failed', 'pending'])
    
    # This is where real Payment processor will be integrated
    
    update_payment_status(transaction_id, payment_status)

    payments[transaction_id] = {
        'status': payment_status,
        'amount': decrypted_amount,
        'currency': decrypted_currency,
        'customerId': decrypted_customer_id
    }

    return {
        'status': payments[transaction_id]['status'],
        'transactionId': transaction_id
    }


def update_payment_status(transaction_id, status):
    payments_collection.update_one(
        {"transactionId": transaction_id},
        {"$set": {"status": status}}
    )

def get_payment_status(transaction_id):
    return payments.get(transaction_id, 'not_found')
