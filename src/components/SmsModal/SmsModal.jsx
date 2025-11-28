import { useState } from "react";
import styles from "./SmsModal.module.css";
import { useEffect } from "react";
import { useRef } from "react";

const SmsModal = ({ isOpen, onClose, onVerify, phoneNumber }) => {
  const [code, setCode] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(29);
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    if (!isOpen) return;

    // Reset code and timer when modal opens
    setCode(["", "", "", ""]);
    setTimer(29);

    inputRefs[0].current?.focus();

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 4);

    if (!/^\d+$/.test(pastedData)) return;

    const newCode = pastedData.split("");
    setCode([...newCode, ...Array(4 - newCode.length).fill("")]);

    // Focus last filled input or next empty
    const focusIndex = Math.min(newCode.length, 3);
    inputRefs[focusIndex].current?.focus();
  };

  const handleResend = () => {
    if (timer === 0) {
      setTimer(29);
      setCode(["", "", "", ""]);
      inputRefs[0].current?.focus();
      // Add your resend SMS logic here
      console.log("Resending SMS...");
    }
  };

  const handleSubmit = () => {
    const fullCode = code.join("");
    if (fullCode.length === 4) {
      onVerify(fullCode);
    }
  };

  const isCodeComplete = code.every((digit) => digit !== "");

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div className={styles.modalBody}>
          <h2 className={styles.title}>Введите СМС-код</h2>

          <p className={styles.description}>
            Введите код, чтобы завершить оформление заказа
            <br />и подтвердить оплату
          </p>

          <div className={styles.codeInputs}>
            {code.map((digit, index) => (
              <input
                key={index}
                ref={inputRefs[index]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className={styles.codeInput}
                placeholder="o"
              />
            ))}
          </div>

          <button
            className={styles.resendButton}
            onClick={handleResend}
            disabled={timer > 0}
          >
            <span className={styles.resendText}>Отправить код повторно</span>
            {timer > 0 && (
              <span className={styles.timer}> через {timer} сек</span>
            )}
          </button>

          <button
            className={`${styles.submitButton} ${
              !isCodeComplete ? styles.disabled : ""
            }`}
            onClick={handleSubmit}
            disabled={!isCodeComplete}
          >
            <span className={styles.submitButtonText}>
              Получить презент и оплатить
            </span>
            <span className={styles.submitButtonTextMobile}>Оплатить</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmsModal;
