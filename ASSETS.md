# Походження матеріалів

Перевірено 4 листопада 2026 року. Усі потрібні файли локальні, без залежності від тимчасових Instagram CDN-посилань.

## Фактичний контекст

Публічний Instagram-профіль [@kolos.tig](https://www.instagram.com/kolos.tig/) переглянуто в окремому браузері без входу в обліковий запис. Bio прямо зазначає TIG-зварювання, Київ, нержавійку, алюміній і сталь. Назва Олександр та описи ремонтів/виготовлення також присутні в публічних оголошеннях, що явно посилаються на `kolos.tig`:

- [Оголошення з фото процесу та швів](https://www.olx.ua/d/uk/obyavlenie/zvaryuvannya-argonom-tig-remont-nerzhavyki-alyumnyu-stal-IDZVKvC.html).
- [Оголошення про ремонт і виготовлення](https://www.olx.ua/d/uk/obyavlenie/zvaryuvannya-svarka-argonom-tig-remont-vigotovlennya-alyumny-nerzhavyka-stal-kiv-ID10N3rb.html).

Належність облікових записів замовнику не встановлювалася. Жодних приватних повідомлень, номерів телефону чи авторизаційних даних не використано.

## Фото майстерні

| Файл | Використання | Публічне джерело |
|---|---|---|
| `assets/work/older-1.jpg` | Майстер за роботою | OLX IDZVKvC, фото `qcl266vj36kh2-UA` |
| `assets/work/older-2.jpg` | Шов зблизька, галерея | OLX IDZVKvC, фото `y4i39xj2x0og2-UA` |
| `assets/work/older-3.jpg` | Зварене з’єднання профілів | OLX IDZVKvC, фото `i4getfq25rz91-UA` |
| `assets/work/older-7.jpg` | Приклад ремонту деталі | OLX IDZVKvC, фото `boxvnu1r6ruw-UA` |
| `assets/work/older-8.jpg` | Зварний шов на виробі | OLX IDZVKvC, фото `1or5ctqrgj6v2-UA` |
| `assets/work/instagram-3.jpg` | Бак для опалення, галерея | [Пост KOLOS TIG](https://www.instagram.com/kolos.tig/p/DeOrWaziLXO/) |
| `assets/work/instagram-11.jpg` | Інформаційна стійка, галерея | [Пост KOLOS TIG](https://www.instagram.com/kolos.tig/p/Db-GcSLCFna/) |

Назви бака та стійки підтверджені написами на самих фото. Матеріал цих двох виробів не вгадується й не зазначений у підписах галереї. Фото з OLX наведено як приклади з публічних матеріалів, без неперевірених тверджень про замовників або дату роботи. Локальний manifest прямих Instagram-постів — `assets/work/sources.json`.

Відбір: знайдено й завантажено 28 зображень із трьох переглянутих публічних джерел; 20 візуально перевірено; інтегровано 7; решта 21 не включена в результат. Серед невключених — 8 прев’ю Reels, для яких подальший перегляд не був потрібен. Скриншоти приватних розмов, хоча й публічно розміщені в оголошенні, у сайт не потрапили. Ручних неперевірених кандидатів у кінцевих матеріалах немає.

## Художній hero

`assets/hero.jpg` — одна ілюстративна генерація вбудованим `image_gen`, перевірена візуально й оптимізована в JPEG через macOS `sips`. Вона не позначається як виконана робота майстерні. Оригінал створений у розмірі 1536 × 1024. Альтернативних генерацій не робилося.

Точний промпт:

> Use case: photorealistic-natural. Asset: one premium website hero photograph for an independent precision TIG welding atelier, horizontal wide composition (3:2). Ultra-detailed cinematic macro photograph of the hands of a skilled TIG welder in worn dark charcoal leather gloves guiding a TIG torch and slim filler rod at a precise angle along a cylindrical brushed stainless steel tube. Bright small icy white-blue TIG arc at center-right, beautifully defined stacked-dime silver weld bead, subtle violet/gold heat tint. No showers of sparks (this is TIG, not grinding), no flames. Near-black workshop background, deep cinematic shadows, tactile authentic steel, editorial industrial luxury photography. Welder hands and torch enter from upper-right and right, tube runs diagonally from lower-left to upper-right; keep upper-left third dark and uncluttered for a website. Photography feels real and physically coherent, high contrast but broad silver highlights, subtle analog film grain, no neon backgrounds, no text, no logos, no watermarks, no typography, not a website screenshot. Single image only.

**Оновлення 2026-11-06 (версія Velira):** `assets/hero.jpg` прибрано з сайту й репо — бриф забороняє згенеровані фото робіт.
Перший екран тепер — справжнє фото `older-1.jpg`. Нових згенерованих зображень немає; світіння дуги малює код (WebGL), а не картинка.

## Шрифти

Manrope 400/600 та Oswald 500 завантажені через Google Fonts; кирилиця перевіряється у фактичному рендері українських текстів. Файли OFL розміщено поруч зі шрифтами. Текстовий логотип і графічний знак створені локально у HTML/SVG для цього дизайну; оригінальне зображення логотипа з профілю не підмінювалося.
