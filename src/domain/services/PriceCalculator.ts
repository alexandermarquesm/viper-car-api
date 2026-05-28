import { IPayment } from "../entities/Wash";

const CREDIT_CARD_FEE_PERCENTAGE = 0.0309; // 3.09%
const DEBIT_CARD_FEE_PERCENTAGE = 0.0089; // 0.89%
const CARD_FEE_LEGACY = 0.0088333; // Fallback legacy card fee

export class PriceCalculator {
  static calculateNetPrice(amount: number, method?: string, customCreditFee?: number, customDebitFee?: number): number {
    if (method === "credit_card") {
      const fee = customCreditFee !== undefined ? customCreditFee / 100 : CREDIT_CARD_FEE_PERCENTAGE;
      return Number((amount - amount * fee).toFixed(2));
    }
    if (method === "debit_card") {
      const fee = customDebitFee !== undefined ? customDebitFee / 100 : DEBIT_CARD_FEE_PERCENTAGE;
      return Number((amount - amount * fee).toFixed(2));
    }
    if (method === "card") {
      return Number((amount - amount * CARD_FEE_LEGACY).toFixed(2));
    }
    return amount; // No discount for money/pix/convenio
  }

  static calculateTotalNetPrice(payments: IPayment[], customCreditFee?: number, customDebitFee?: number): number {
    if (!payments || !Array.isArray(payments)) return 0;
    
    let totalNet = 0;
    for (const payment of payments) {
      totalNet += this.calculateNetPrice(payment.amount, payment.method, customCreditFee, customDebitFee);
    }
    return Number(totalNet.toFixed(2));
  }
}
