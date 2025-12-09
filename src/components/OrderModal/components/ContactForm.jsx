import { useOrderStore } from "../../../store/orderStore";
import styles from "../OrderModal.module.css";

export default function ContactForm() {
  const { formData, errors, setField, setPhone } = useOrderStore();
  const handleTelegramChange = (e) => {
    let val = e.target.value;

    // 1. Убираем "собачку", если пользователь пытается её ввести сам (она есть в UI)
    val = val.replace("@", "");

    // 2. Убираем русские буквы, пробелы и спецсимволы (оставляем латиницу, цифры, underscore)
    // Регулярка [^a-zA-Z0-9_] найдет все запрещенные символы
    val = val.replace(/[^a-zA-Z0-9_]/g, "");

    // 3. Ограничиваем длину 20 символами
    if (val.length > 20) {
      val = val.slice(0, 20);
    }

    setField("telegramUsername", val);
  };
  return (
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>Контактные данные</h3>

      <div className={styles.inputGroup}>
        <label className={styles.label}>
          Имя<span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setField("name", e.target.value)}
          placeholder="Введите имя..."
          className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
        />
        {errors.name && (
          <div className={styles.errorMessage}>{errors.name}</div>
        )}
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.label}>
          Телефон<span className={styles.required}>*</span>
        </label>
        <input
          type="tel"
          value={formData.phone}
          // Здесь используется обновленный setPhone из стора
          onChange={(e) => setPhone("phone", e.target.value)}
          placeholder="+7 (000) 000-00-00"
          className={`${styles.input} ${errors.phone ? styles.inputError : ""}`}
        />
        {errors.phone && (
          <div className={styles.errorMessage}>{errors.phone}</div>
        )}
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.label}>
          Email<span className={styles.required}>*</span>
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setField("email", e.target.value)}
          placeholder="Введите свою почту"
          className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
        />
        {errors.email && (
          <div className={styles.errorMessage}>{errors.email}</div>
        )}
      </div>

      <div className={styles.checkboxRow}>
        <span className={styles.checkboxText}>
          Хочу получать информацию о заказе в Telegram
        </span>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={formData.telegramNotify}
            onChange={(e) => setField("telegramNotify", e.target.checked)}
          />
          <span className={styles.toggleSlider}></span>
        </label>
      </div>

      {formData.telegramNotify && (
        <div className={styles.inputGroup}>
          <div className={styles.telegramInput}>
            <span className={styles.telegramPrefix}>@</span>
            <input
              type="text"
              value={formData.telegramUsername}
              // Используем наш валидатор
              onChange={handleTelegramChange}
              placeholder="username"
              className={`${styles.input} ${
                errors.telegramUsername ? styles.inputError : ""
              }`}
            />
          </div>
          {errors.telegramUsername && (
            <div className={styles.errorMessage}>{errors.telegramUsername}</div>
          )}
        </div>
      )}
    </section>
  );
}
