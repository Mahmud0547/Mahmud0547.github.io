import type { Locale } from "@/lib/locale";

// Text of the interactive blocks in articles (case studies). Example tasks are typical, not measured; the reader sets the numbers.

const en = {
  routine: {
    title: "What does your routine cost?",
    intro: "Pick a task like yours or set your own numbers. A bot does the work; a person only checks the result, the way the editor checks Simorgh's drafts.",
    examples: "Examples",
    presets: [
      { name: "Answering the same customer questions", perDay: 40, minutes: 3, checkMinutes: 0.5 },
      { name: "Copying orders into a spreadsheet", perDay: 25, minutes: 4, checkMinutes: 0.5 },
      { name: "Reading news and writing channel posts", perDay: 20, minutes: 15, checkMinutes: 1 },
    ],
    perDay: "Times a day",
    minutes: "Minutes each time, by hand",
    checkMinutes: "Minutes to check, with a bot",
    rate: "Cost of one working hour, $",
    byHand: "By hand",
    withBot: "With a bot",
    hoursMonth: "{n} h a month",
    saved: "You get back {hours} hours and ${money} every month.",
    payback: "A ${price} bot pays for itself in {days} working days.",
    nothing: "Here the check takes as long as the task — a bot would not help. Not every task needs one.",
  },
};

export type ArticleStrings = typeof en;

const ru: ArticleStrings = {
  routine: {
    title: "Сколько стоит ваша рутина?",
    intro: "Выберите задачу, похожую на вашу, или задайте свои цифры. Работу делает бот; человек только проверяет результат — так же, как редактор проверяет черновики Simorgh.",
    examples: "Примеры",
    presets: [
      { name: "Ответы на одни и те же вопросы клиентов", perDay: 40, minutes: 3, checkMinutes: 0.5 },
      { name: "Перенос заказов в таблицу", perDay: 25, minutes: 4, checkMinutes: 0.5 },
      { name: "Чтение новостей и посты для канала", perDay: 20, minutes: 15, checkMinutes: 1 },
    ],
    perDay: "Раз в день",
    minutes: "Минут на один раз вручную",
    checkMinutes: "Минут на проверку с ботом",
    rate: "Стоимость рабочего часа, $",
    byHand: "Вручную",
    withBot: "С ботом",
    hoursMonth: "{n} ч в месяц",
    saved: "Вы возвращаете себе {hours} часов и ${money} каждый месяц.",
    payback: "Бот за ${price} окупается за {days} рабочих дней.",
    nothing: "Здесь проверка занимает столько же, сколько сама задача, — бот не поможет. Не каждой задаче он нужен.",
  },
};

const tj: ArticleStrings = {
  routine: {
    title: "Кори ҳаррӯзаи шумо чанд пул арзиш дорад?",
    intro: "Вазифаеро, ки ба кори шумо монанд аст, интихоб кунед ё рақамҳои худро гузоред. Корро бот иҷро мекунад; одам танҳо натиҷаро месанҷад — ҳамон тавре ки муҳаррир лоиҳаҳои Simorgh-ро месанҷад.",
    examples: "Намунаҳо",
    presets: [
      { name: "Ҷавоб ба ҳамон саволҳои муштариён", perDay: 40, minutes: 3, checkMinutes: 0.5 },
      { name: "Интиқоли фармоишҳо ба ҷадвал", perDay: 25, minutes: 4, checkMinutes: 0.5 },
      { name: "Хондани хабарҳо ва навиштани пост барои канал", perDay: 20, minutes: 15, checkMinutes: 1 },
    ],
    perDay: "Чанд маротиба дар рӯз",
    minutes: "Дақиқа барои як маротиба дастӣ",
    checkMinutes: "Дақиқа барои санҷиш бо бот",
    rate: "Арзиши як соати корӣ, $",
    byHand: "Дастӣ",
    withBot: "Бо бот",
    hoursMonth: "{n} соат дар як моҳ",
    saved: "Шумо ҳар моҳ {hours} соат ва ${money} бармегардонед.",
    payback: "Боти ${price} дар {days} рӯзи корӣ худашро сафед мекунад.",
    nothing: "Дар ин ҷо санҷиш ҳамон қадар вақт мегирад, ки худи кор — бот кӯмак намекунад. На ҳар кор ба бот ниёз дорад.",
  },
};

export const articleStrings: Record<Locale, ArticleStrings> = { en, ru, tj };
