/**
 * Checkout Summary Component
 *
 * Riepilogo ordine con prezzo, promozioni e referral
 */
'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Check, Tag } from 'lucide-react';
export function CheckoutSummary({ title, description, amount, currency = 'EUR', items, discountTotal, promoCode, promotion, referralCode, }) {
    const formatPrice = (price) => {
        return new Intl.NumberFormat('it-IT', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
        }).format(price);
    };
    let finalAmount = amount;
    let discountAmount = 0;
    if (promotion && promotion.type === 'STRIPE_COUPON') {
        if (promotion.discountType === 'PERCENTAGE' && promotion.discountValue) {
            discountAmount = (amount * promotion.discountValue) / 100;
            finalAmount = amount - discountAmount;
        }
        else if (promotion.discountType === 'FIXED_AMOUNT' && promotion.discountValue) {
            discountAmount = promotion.discountValue;
            finalAmount = amount - discountAmount;
        }
    }
    return (_jsxs("div", { className: "rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-800", children: [_jsx("h3", { className: "mb-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100", children: "Riepilogo Ordine" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-neutral-700 dark:text-neutral-300", children: title }), description && (_jsx("p", { className: "text-xs text-neutral-500 dark:text-neutral-400", children: description }))] }), items && items.length > 0 && (_jsx("div", { className: "space-y-2 rounded-md border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-800/60", children: items.map((item, idx) => (_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "text-xs text-neutral-600 dark:text-neutral-300", children: [item.title, item.quantity > 1 && ` x${item.quantity}`] }), _jsx("div", { className: "text-xs font-medium text-neutral-800 dark:text-neutral-100", children: formatPrice(item.amount) })] }, `${item.title}-${idx}`))) })), promoCode && promotion && (_jsxs("div", { className: "flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 dark:border-green-800 dark:bg-green-900/20", children: [_jsx(Tag, { className: "h-4 w-4 text-green-600 dark:text-green-400" }), _jsxs("div", { className: "flex-1", children: [_jsxs("p", { className: "text-xs font-medium text-green-800 dark:text-green-300", children: ["Promozione: ", promoCode] }), promotion.description && (_jsx("p", { className: "text-xs text-green-700 dark:text-green-400", children: promotion.description })), promotion.type === 'BONUS_CREDITS' && promotion.bonusCredits && (_jsxs("p", { className: "text-xs text-green-700 dark:text-green-400", children: ["+", promotion.bonusCredits, " crediti bonus"] }))] })] })), referralCode && (_jsxs("div", { className: "flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 dark:border-blue-800 dark:bg-blue-900/20", children: [_jsx(Check, { className: "h-4 w-4 text-blue-600 dark:text-blue-400" }), _jsxs("p", { className: "text-xs font-medium text-blue-800 dark:text-blue-300", children: ["Codice referral attivo: ", referralCode] })] })), _jsxs("div", { className: "border-t border-neutral-200 pt-3 dark:border-neutral-700", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-neutral-600 dark:text-neutral-400", children: "Subtotale" }), _jsx("span", { className: "text-sm font-medium text-neutral-900 dark:text-neutral-100", children: formatPrice(amount) })] }), discountTotal !== undefined && discountTotal > 0 && (_jsxs("div", { className: "mt-2 flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-green-600 dark:text-green-400", children: "Sconto" }), _jsxs("span", { className: "text-sm font-medium text-green-600 dark:text-green-400", children: ["-", formatPrice(discountTotal)] })] })), discountAmount > 0 && (_jsxs("div", { className: "mt-2 flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-green-600 dark:text-green-400", children: "Sconto" }), _jsxs("span", { className: "text-sm font-medium text-green-600 dark:text-green-400", children: ["-", formatPrice(discountAmount)] })] })), _jsxs("div", { className: "mt-3 flex items-center justify-between border-t border-neutral-200 pt-3 dark:border-neutral-700", children: [_jsx("span", { className: "text-base font-semibold text-neutral-900 dark:text-neutral-100", children: "Totale" }), _jsx("span", { className: "text-xl font-bold text-neutral-900 dark:text-neutral-100", children: formatPrice(finalAmount) })] })] })] })] }));
}
