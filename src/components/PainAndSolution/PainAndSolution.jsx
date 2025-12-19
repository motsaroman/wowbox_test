import styles from './PainAndSolution.module.css';

import videoPoster from '../../assets/images/video-poster.jpg';
import solutionMan from '../../assets/images/solution-man.png';
import painVideo from '../../assets/videos/video.mp4';

export default function PainAndSolution() {
  const cloudsData = [
    {
      id: 1,
      cloudClass: 'cloud1',
      cloudTitle: 'Не знаю, что подарить',
      descBlack: 'или спросить напрямую?',
      descRed: 'Ответят "да ничего не надо"',
    },
    {
      id: 2,
      cloudClass: 'cloud2',
      cloudTitle: 'Боюсь, что подарок не понравится',
      descBlack: 'Или купить сертификат?',
      descRed: 'Не воспользуются',
    },
    {
      id: 3,
      cloudClass: 'cloud3',
      cloudTitle: 'Не хватает времени на выбор',
      descBlack: 'Или купить готовый набор?',
      descRed: 'Половина товаров не подойдет',
    },
    {
      id: 4,
      cloudClass: 'cloud4',
      cloudTitle: 'Хочу удивить, но все банально',
      descBlack: 'Или спросить совета у друзей?',
      descRed: 'Они, как и ты, не знают',
    },
  ];

  return (
    <section className={styles.painAndSolution}>
      <div className={styles.topContainer}>
        <div className={styles.videoOuter}>
          <div className={styles.videoWrapper}>
            <video className={styles.video} poster={videoPoster} controls>
              <source
                src={painVideo}
                type="video/mp4"
                autoPlay
                muted
                loop
                playsInline
              />
            </video>
          </div>
        </div>

        <div className={styles.textPain}>
          <h2 className={styles.titlePain}>Снова будешь дарить “носки”?</h2>
          <p className={styles.descPain}>
            Или потратишь 3 часа на поиски подарка, купишь что-то "нормальное",
            а потом увидишь вежливую улыбку "спасибо, как раз нужно было"?
          </p>

          <a href="#quiz" className={styles.buttonSolution}>
            <span>Хватит угадывать — подарите то, что хотят</span>
          </a>
        </div>
      </div>
      *
      <div className={styles.bottomContainer}>
        <div className={styles.cloudsWrapper}>
          {cloudsData.map((cloud) => (
            <div key={cloud.id} className={styles[cloud.cloudClass]}>
              <div className={styles.cloudText}>
                <h3 className={styles.cloudTitle}>{cloud.cloudTitle}</h3>
                <p className={styles.descBlack}>{cloud.descBlack}</p>
                <p className={styles.descRed}>{cloud.descRed}</p>
              </div>
            </div>
          ))}
        </div>
        <img src={solutionMan} alt="" className={styles.solutionMan} />
      </div>
    </section>
  );
}
