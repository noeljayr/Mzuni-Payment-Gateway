const express = require("express");
const router = express.Router();
const axios = require("axios");
const { check, validationResult } = require("express-validator");
const { encrypt } = require("../utils/encryption");
const apiKeyAuth = require('../middlewares/apiKeyAuth');
const rateLimiter = require('../middlewares/rateLimiter');
const Payment = require("../models/PaymentModel");

// Apply the apiKeyAuth and rateLimiter middlewares to all routes
router.use(apiKeyAuth);
router.use(rateLimiter);

router.post(
  "/initiate",
  [
    check("amount")
      .isFloat({ gt: 0 })
      .withMessage("Amount must be a positive number"),
    check("currency").isString().withMessage("Currency must be a string"),
    check("customerId").isString().withMessage("Customer ID must be a string"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const paymentDetails = req.body;

      const encryptedDetails = {
        amount: encrypt(paymentDetails.amount.toString()),
        currency: encrypt(paymentDetails.currency),
        customerId: encrypt(paymentDetails.customerId),
        merchantId: encrypt(paymentDetails.merchantId),
      };

      const response = await axios.post(
        `http://localhost:5001/process-payment`,
        encryptedDetails
      );

      if (response.status === 200) {
        const payment = new Payment({
          merchantId: paymentDetails.merchantId,
          amount: encryptedDetails.amount,
          currency: encryptedDetails.currency,
          customerId: encryptedDetails.customerId,
          transactionId: response.data.transactionId,
          status: response.data.status,
        });

        await payment.save();

        return res.status(200).json({
          message: "Payment initiated successfully",
          transactionId: response.data.transactionId,
          status: response.data.status,
        });
      } else {
        return res
          .status(response.status)
          .json({ message: "Failed to initiate payment" });
      }
    } catch (error) {
      console.error("Payment initiation error:", error.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Payment status check endpoint
router.get(
  "/status/:transactionId",
  [
    check("transactionId")
      .isUUID()
      .withMessage("Invalid transaction ID format"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { transactionId } = req.params;

      // Forward the transactionId to the Python backend
      const response = await axios.get(
        `http://localhost:5001/payment-status/${transactionId}`
      );

      if (response.status === 200) {
        return res.status(200).json(response.data);
      } else {
        return res
          .status(response.status)
          .json({ message: "Failed to retrieve payment status" });
      }
    } catch (error) {
      console.error("Payment status error:", error.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.put("/update-status/:transactionId", async (req, res) => {
  try {
    const { status } = req.body;

    const payment = await Payment.findOneAndUpdate(
      { transactionId: req.params.transactionId },
      { status },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    return res.status(200).json(payment);
  } catch (error) {
    console.error("Error updating payment status:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
