const express = require("express");
const { MOMO_NUMBER, MOMO_LABEL } = require("../config/payment");

const router = express.Router();

router.get("/momo", (_req, res) => {
  res.json({
    number: MOMO_NUMBER,
    label: MOMO_LABEL,
    instructions: `Send payment to MoMo number ${MOMO_NUMBER}, then place your order.`,
  });
});

module.exports = router;
