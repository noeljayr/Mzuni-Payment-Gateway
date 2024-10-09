from flask import Flask, request, jsonify
from app.transactions import process_payment
from app.transactions import get_payment_status

app = Flask(__name__)

@app.route('/process-payment', methods=['POST'])
def process_payment_route():
    payment_details = request.json
    result = process_payment(payment_details)
    
    
    #simulating payment processing. real processor integration in the future
    match result['status'] :
        case 'success':
            return jsonify(transactionId=result['transactionId'], status=result['status']), 200
        case 'pending':
            return jsonify(transactionId=result['transactionId'], status=result['status']), 200
        case 'failed':
            return jsonify(transactionId=result['transactionId'], status=result['status']), 200
        case _:
            return jsonify(message=result), 400

@app.route('/payment-status/<transaction_id>', methods=['GET'])
def payment_status_route(transaction_id):
    status = get_payment_status(transaction_id)

    if status != 'not_found':
        return jsonify(transactionId=transaction_id, status=status), 200
    else:
        return jsonify(message='Transaction not found'), 404

if __name__ == '__main__':
    app.run(port=5001)
