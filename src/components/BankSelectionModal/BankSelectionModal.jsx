import React, { useState } from "react";
import styles from "./BankSelectionModal.module.css";

// Bank logos import (you'll need to add your actual logo images)
import alfaBankLogo from "../../assets/icons/alfabank.svg";
import tBankLogo from "../../assets/icons/tbank.svg";
import raiffeisenLogo from "../../assets/icons/raiffeisenBank.svg";
import vtbLogo from "../../assets/icons/btb.svg";
import sberbankLogo from "../../assets/icons/sberBank.svg";

const BankSelectionModal = ({ isOpen = true, onClose, onSelectBank }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const banks = [
    { id: 1, name: "АЛЬФА-БАНК", logo: alfaBankLogo },
    { id: 2, name: "Т-БАНК", logo: tBankLogo },
    { id: 3, name: "Райффайзенбанк", logo: raiffeisenLogo },
    { id: 4, name: "Банк ВТБ", logo: vtbLogo },
    { id: 5, name: "Сбербанк", logo: sberbankLogo },
    { id: 6, name: "АЛЬФА-БАНК", logo: alfaBankLogo },
    { id: 7, name: "Т-БАНК", logo: tBankLogo },
    { id: 8, name: "Райффайзенбанк", logo: raiffeisenLogo },
    { id: 9, name: "Банк ВТБ", logo: vtbLogo },
  ];

  const filteredBanks = banks.filter((bank) =>
    bank.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBankSelect = (bank) => {
    onSelectBank(bank);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <button
            className={styles.backButton}
            onClick={onClose}
            aria-label="Go back"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <h2 className={styles.title}>Оплата СБП</h2>
          <div className={styles.placeholder}></div>
        </div>

        {/* Search */}
        <div className={styles.searchWrapper}>
          <div className={styles.searchBox}>
            <svg
              className={styles.searchIcon}
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
            >
              <circle cx="9" cy="9" r="6" stroke="#999" strokeWidth="1.5" />
              <path
                d="M13.5 13.5L17 17"
                stroke="#999"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="text"
              placeholder="Поиск по банку"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            {searchQuery && (
              <button
                className={styles.clearButton}
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M12 4L4 12M4 4L12 12"
                    stroke="#999"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Bank List */}
        <div className={styles.bankList}>
          {filteredBanks.length > 0 ? (
            filteredBanks.map((bank) => (
              <button
                key={bank.id}
                className={styles.bankItem}
                onClick={() => handleBankSelect(bank)}
              >
                <div
                  className={styles.bankLogo}
                  style={{ backgroundColor: bank.bgColor }}
                >
                  <img src={bank.logo} alt={bank.name} loading="lazy" />
                </div>
                <span className={styles.bankName}>{bank.name}</span>
              </button>
            ))
          ) : (
            <div className={styles.emptyState}>
              <p>Банк не найден</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BankSelectionModal;
