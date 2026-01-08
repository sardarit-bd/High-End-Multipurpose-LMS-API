"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToyyibPayProvider = void 0;
class ToyyibPayProvider {
    createCheckoutSession(input) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: call ToyyibPay bill API and return redirect
            return { sessionId: `fake_toyyib_${input.orderId}`, checkoutUrl: `https://toyyibpay.test/redirect/${input.orderId}` };
        });
    }
}
exports.ToyyibPayProvider = ToyyibPayProvider;
