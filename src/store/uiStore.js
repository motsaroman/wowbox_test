import { create } from 'zustand';

export const useUIStore = create((set) => ({
  // --- STATE ---
  isMobileMenuOpen: false,
  openFaqIndex: 0,
  
  // Состояния модалок оплаты
  isDeliveryModalOpen: false,
  isSmsModalOpen: false,
  isPaymentResultModalOpen: false,
  isBankSelectionModalOpen: false,
  isPaymentWaitingModalOpen: false,
  
  // Данные для оплаты
  selectedPaymentMethod: "sbp",

  // --- ACTIONS ---
  
  // Мобильное меню
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),

  // FAQ
  toggleFaq: (index) => set((state) => ({ 
    openFaqIndex: state.openFaqIndex === index ? null : index 
  })),

  // Управление модалками
  setDeliveryModalOpen: (isOpen) => set({ isDeliveryModalOpen: isOpen }),
  setSmsModalOpen: (isOpen) => set({ isSmsModalOpen: isOpen }),
  setPaymentResultModalOpen: (isOpen) => set({ isPaymentResultModalOpen: isOpen }),
  setBankSelectionModalOpen: (isOpen) => set({ isBankSelectionModalOpen: isOpen }),
  setPaymentWaitingModalOpen: (isOpen) => set({ isPaymentWaitingModalOpen: isOpen }),
  
  setSelectedPaymentMethod: (method) => set({ selectedPaymentMethod: method }),

  // Сброс флоу оплаты (удобно при закрытии или успешной оплате)
  resetPaymentFlow: () => set({
    isDeliveryModalOpen: false,
    isSmsModalOpen: false,
    isPaymentResultModalOpen: false,
    isBankSelectionModalOpen: false,
    isPaymentWaitingModalOpen: false,
  })
}));