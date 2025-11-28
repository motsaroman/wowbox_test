import tgIcon from "../../assets/images/telegramChatIcon.webp";
import tgChat from "../../assets/images/telegramChatsms.webp";

import styles from "./TelegramChat.module.css";

export default function TelegramChat() {
  return (
    <div className={styles.telegramChat}>
      <img src={tgChat} alt="Telegram Chat" loading="lazy" />
      <img src={tgIcon} alt="Telegram Icon" loading="lazy" />
    </div>
  );
}
