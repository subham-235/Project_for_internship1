"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { CheckCircle2, Clock3, CreditCard, LockKeyhole, QrCode, ShieldCheck, Smartphone } from "lucide-react";

export type PaymentDraft = {
  method: "upi" | "card";
  upiMode: "qr" | "id";
  upiId: string;
  upiReference: string;
  cardName: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
};

export const EMPTY_PAYMENT: PaymentDraft = {
  method: "upi",
  upiMode: "qr",
  upiId: "",
  upiReference: "",
  cardName: "",
  cardNumber: "",
  cardExpiry: "",
  cardCvv: "",
};

function luhnValid(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 15 || digits.length > 19) return false;
  let total = 0;
  let double = false;
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let number = Number(digits[index]);
    if (double) {
      number *= 2;
      if (number > 9) number -= 9;
    }
    total += number;
    double = !double;
  }
  return total % 10 === 0;
}

export function validatePaymentDraft(payment: PaymentDraft) {
  if (payment.method === "upi") {
    if (payment.upiMode === "id" && !/^[\w.-]{2,256}@[a-zA-Z]{2,64}$/.test(payment.upiId.trim())) {
      return "Please enter a valid UPI ID, such as name@bank.";
    }
    if (payment.upiMode === "qr" && !/^[a-zA-Z0-9]{8,20}$/.test(payment.upiReference.trim())) {
      return "After paying by QR, enter the 8 to 20 character UPI transaction reference.";
    }
    return "";
  }

  if (payment.cardName.trim().length < 3) return "Enter the cardholder name.";
  if (!luhnValid(payment.cardNumber)) return "Enter a valid card number.";
  const expiry = payment.cardExpiry.match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
  if (!expiry) return "Enter card expiry in MM/YY format.";
  const expiryDate = new Date(2000 + Number(expiry[2]), Number(expiry[1]), 0, 23, 59, 59);
  if (expiryDate.getTime() < Date.now()) return "This card has expired.";
  if (!/^\d{3,4}$/.test(payment.cardCvv)) return "Enter a valid CVV.";
  return "";
}

function formatCardNumber(value: string) {
  return value.replace(/\D/g, "").slice(0, 19).replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

export default function PaymentPanel({ amount, value, onChange, timeRemaining }: { amount: number; value: PaymentDraft; onChange: (payment: PaymentDraft) => void; timeRemaining: number }) {
  const [qrUrl, setQrUrl] = useState("");
  const update = (changes: Partial<PaymentDraft>) => onChange({ ...value, ...changes });

  useEffect(() => {
    const upiUrl = `upi://pay?pa=schedula@upi&pn=Schedula&am=${amount}&cu=INR`;
    QRCode.toDataURL(upiUrl, { width: 360, margin: 1, color: { dark: "#0B1329", light: "#FFFFFF" } })
      .then(setQrUrl)
      .catch(() => setQrUrl(""));
  }, [amount]);

  return (
    <section className="overflow-hidden rounded-[18px] border border-[#E2E8F0] bg-white shadow-[0_12px_35px_rgba(11,19,41,0.05)]">
      <header className="flex flex-col gap-3 border-b border-[#E2E8F0] bg-[#0B1329] py-5 pl-5 pr-16 text-white sm:flex-row sm:items-center sm:justify-between sm:pl-6 sm:pr-16">
        <div><p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#93C5FD]">Step 5</p><h2 className="mt-1 text-lg font-bold">Secure payment</h2><p className="mt-1 text-xs text-white/55">Choose UPI or card to complete the appointment request.</p></div>
        <div className="mr-8 flex items-center gap-2"><div className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${timeRemaining <= 60 ? "border-rose-400/40 bg-rose-400/10 text-rose-200" : "border-white/10 bg-white/5"}`}><Clock3 size={16} /><div><p className="text-[9px] text-white/50">Session expires in</p><p className="font-mono text-xs font-bold">{String(Math.floor(timeRemaining / 60)).padStart(2, "0")}:{String(timeRemaining % 60).padStart(2, "0")}</p></div></div><div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 lg:flex"><ShieldCheck size={17} className="text-emerald-400" /><div><p className="text-[10px] font-bold">Protected checkout</p><p className="text-[9px] text-white/50">Card details are never stored</p></div></div></div>
      </header>

      <div className="grid md:grid-cols-[12rem_minmax(0,1fr)]">
        <nav className="border-b border-[#E2E8F0] bg-[#F8FAFC] p-3 md:border-b-0 md:border-r" aria-label="Payment methods">
          <button type="button" onClick={() => update({ method: "upi" })} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold transition ${value.method === "upi" ? "bg-white text-[#2563EB] shadow-sm ring-1 ring-[#DBEAFE]" : "text-[#64748B] hover:bg-white"}`}><Smartphone size={18} /><span className="flex-1">UPI</span>{value.method === "upi" && <CheckCircle2 size={15} />}</button>
          <button type="button" onClick={() => update({ method: "card" })} className={`mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold transition ${value.method === "card" ? "bg-white text-[#2563EB] shadow-sm ring-1 ring-[#DBEAFE]" : "text-[#64748B] hover:bg-white"}`}><CreditCard size={18} /><span className="flex-1">Cards</span>{value.method === "card" && <CheckCircle2 size={15} />}</button>
          <div className="mt-5 rounded-xl bg-[#DBEAFE]/60 p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-[#64748B]">Amount payable</p><p className="mt-1 text-2xl font-extrabold text-[#0B1329]">₹{amount}</p><p className="mt-1 text-[9px] text-[#64748B]">Consultation fee · No extra charge</p></div>
        </nav>

        <div className="p-5 sm:p-6">
          {value.method === "upi" ? (
            <div>
              <div className="flex gap-2 rounded-xl bg-[#F8FAFC] p-1.5">
                <button type="button" onClick={() => update({ upiMode: "qr" })} className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-bold ${value.upiMode === "qr" ? "bg-white text-[#2563EB] shadow-sm" : "text-[#64748B]"}`}><QrCode size={15} />Scan QR</button>
                <button type="button" onClick={() => update({ upiMode: "id" })} className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-bold ${value.upiMode === "id" ? "bg-white text-[#2563EB] shadow-sm" : "text-[#64748B]"}`}><Smartphone size={15} />UPI ID</button>
              </div>

              {value.upiMode === "qr" ? (
                <div className="mt-5 grid items-center gap-5 sm:grid-cols-[10rem_minmax(0,1fr)]">
                  <div className="mx-auto rounded-2xl border border-[#E2E8F0] bg-white p-2 shadow-sm">{qrUrl ? <Image src={qrUrl} alt="Schedula UPI payment QR code" width={144} height={144} unoptimized className="size-36" /> : <div className="grid size-36 place-items-center text-xs text-[#64748B]">Preparing QR...</div>}</div>
                  <div><h3 className="text-sm font-bold text-[#0B1329]">Scan with any UPI app</h3><p className="mt-1 text-xs leading-5 text-[#64748B]">Pay ₹{amount}, then enter the transaction reference shown by your UPI app.</p><label className="mt-4 block text-xs font-bold text-[#334155]">UPI transaction reference<input value={value.upiReference} onChange={(event) => update({ upiReference: event.target.value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 20) })} placeholder="Enter UTR / reference number" className="mt-2 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm font-medium outline-none focus:border-[#2563EB]" /></label></div>
                </div>
              ) : (
                <div className="mx-auto mt-6 max-w-lg"><label className="block text-xs font-bold text-[#334155]">UPI ID / Number<input value={value.upiId} onChange={(event) => update({ upiId: event.target.value.slice(0, 80) })} placeholder="name@bank" autoComplete="off" className="mt-2 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3.5 text-sm font-medium outline-none focus:border-[#2563EB]" /></label><p className="mt-3 text-xs leading-5 text-[#64748B]">A payment request will be sent to the linked UPI app when you submit.</p></div>
              )}
            </div>
          ) : (
            <div className="mx-auto max-w-xl">
              <div className="flex items-center justify-between"><div><h3 className="text-sm font-bold">Credit or debit card</h3><p className="mt-1 text-xs text-[#64748B]">Visa, Mastercard and RuPay supported</p></div><div className="flex gap-1"><span className="rounded bg-blue-50 px-2 py-1 text-[9px] font-black text-blue-700">VISA</span><span className="rounded bg-orange-50 px-2 py-1 text-[9px] font-black text-orange-700">MC</span><span className="rounded bg-emerald-50 px-2 py-1 text-[9px] font-black text-emerald-700">RuPay</span></div></div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="text-xs font-bold text-[#334155] sm:col-span-2">Card number<div className="relative mt-2"><CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={17} /><input inputMode="numeric" autoComplete="cc-number" value={value.cardNumber} onChange={(event) => update({ cardNumber: formatCardNumber(event.target.value) })} placeholder="1234 5678 9012 3456" className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] py-3.5 pl-11 pr-4 text-sm font-medium tracking-wider outline-none focus:border-[#2563EB]" /></div></label>
                <label className="text-xs font-bold text-[#334155] sm:col-span-2">Name on card<input autoComplete="cc-name" value={value.cardName} onChange={(event) => update({ cardName: event.target.value.slice(0, 70) })} placeholder="Cardholder name" className="mt-2 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3.5 text-sm font-medium outline-none focus:border-[#2563EB]" /></label>
                <label className="text-xs font-bold text-[#334155]">Expiry<input inputMode="numeric" autoComplete="cc-exp" value={value.cardExpiry} onChange={(event) => update({ cardExpiry: formatExpiry(event.target.value) })} placeholder="MM/YY" className="mt-2 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3.5 text-sm font-medium outline-none focus:border-[#2563EB]" /></label>
                <label className="text-xs font-bold text-[#334155]">CVV<div className="relative mt-2"><input type="password" inputMode="numeric" autoComplete="cc-csc" value={value.cardCvv} onChange={(event) => update({ cardCvv: event.target.value.replace(/\D/g, "").slice(0, 4) })} placeholder="•••" className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3.5 pr-10 text-sm font-medium outline-none focus:border-[#2563EB]" /><LockKeyhole className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={16} /></div></label>
              </div>
            </div>
          )}
          <div className="mt-6 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-[10px] leading-4 text-amber-800"><ShieldCheck size={14} className="mt-0.5 shrink-0" /><p><strong>Demo payment environment:</strong> validation and booking flow are functional, but no real money is charged until a payment gateway is connected.</p></div>
        </div>
      </div>
    </section>
  );
}
