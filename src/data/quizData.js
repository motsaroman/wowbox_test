import weFoundYourSuperWowboxBag from "../assets/icons/weFoundYourSuperWowboxBag.svg";
import weFoundYourSuperWowboxHeands from "../assets/icons/weFoundYourSuperWowboxHeands.svg";
import weFoundYourSuperWowboxHeart from "../assets/icons/weFoundYourSuperWowboxHeart.svg";
import weFoundYourSuperWowboxStar from "../assets/icons/weFoundYourSuperWowboxStar.svg";
import weFoundYourSuperWowboxTwoHeart from "../assets/icons/weFoundYourSuperWowboxTwoHeart.svg";

import questtion1 from "../assets/images/questrion1.webp";
import questtion2 from "../assets/images/question2.webp";
import questtion3 from "../assets/images/question3.webp";
import questtion4 from "../assets/images/question4.webp";
import questtion5 from "../assets/images/question5.webp";
import questtion6 from "../assets/images/question6.webp";
import questtion7 from "../assets/images/question7.webp";
import questtion8 from "../assets/images/question8.webp";

import woman from "../assets/images/womenIcon.webp";
import man from "../assets/images/manIcon.webp";
import other from "../assets/images/other.webp";

export const quizData = [
    {
        question: "Для кого подарок?",
        options: [
            {
                id: "self",
                icon: weFoundYourSuperWowboxStar,
                title: "Для себя",
                subtitle: "Хочу порадовать себя",
            },
            {
                id: "partner",
                icon: weFoundYourSuperWowboxHeart,
                title: "Для партнёра",
                subtitle: "Любимому человеку",
            },
            {
                id: "friend",
                icon: weFoundYourSuperWowboxHeands,
                title: "Для друга",
                subtitle: "Другу или подруге",
            },
            {
                id: "colleague",
                icon: weFoundYourSuperWowboxBag,
                title: "Для коллеги",
                subtitle: "Коллеге по работе",
            },
            {
                id: "relative",
                icon: weFoundYourSuperWowboxTwoHeart,
                title: "Для родственника",
                subtitle: "Маме, папе, брату, сестре",
            },
        ],
    },
    {
        question: "Пол получателя",
        options: [
            { id: "woman", icon: woman, title: "Женщина" },
            { id: "man", icon: man, title: "Мужчина" },
            { id: "other", icon: other, title: "Не важно" },
        ],
    },
    {
        question: "Что больше всего нравится?",
        options: [
            {
                id: "practical",
                icon: questtion1,
                title: "Гаджеты и техно",
                subtitle: "Современные устройства, умные штуки",
            },
            {
                id: "emotions",
                icon: questtion2,
                title: "Уют и комфорт",
                subtitle: "Тепло, спокойствие, домашняя атмосфера",
            },
            {
                id: "quality",
                icon: questtion3,
                title: "Веселье и игры",
                subtitle: "Тусовки, развлечения, активный отдых",
            },
            {
                id: "surprise",
                icon: questtion4,
                title: "Сладости и вкусняшки",
                subtitle: "Шоколад, десерты, гастрономия",
            },
        ],
    },
    {
        question: "Что важнее всего в подарке?",
        options: [
            {
                id: "standard",
                icon: questtion5,
                title: "Чтобы точно пригодилось",
                subtitle: "Полезные вещи, которые пригодятся",
            },
            {
                id: "premium",
                icon: questtion6,
                title: "Чтобы удивило и запомнилось",
                subtitle: "Креативные штуки, которых ни у кого нет",
            },
            {
                id: "luxury",
                icon: questtion7,
                title: "Чтобы выглядело дорого",
                subtitle: "Премиум, дорого выглядящее",
            },
            {
                id: "any",
                icon: questtion8,
                title: "Чтобы было разнообразно",
                subtitle: "Сбалансированный микс",
            },
        ],
    },
];