# תשתית Layout – השמה לסמינר טכנולוגי

## שפת עיצוב מעודכנת (Light + Dark)

המערכת משתמשת באותה שפה ויזואלית בשני מצבים:

- **Light**: בהיר, נקי, מבוסס Beige + Pink.
- **Dark**: כהה חם ומעוצב (Brown-based), ללא שחור/כחול כהה אגרסיבי.
- **Pink Accent** נשמר כחלק מהמותג גם במצב כהה.
- המטרה: מראה אחיד של אותו מוצר, לא "גרסה הפוכה" של צבעים.

## עקרונות צבע (חובה)

- לא להשתמש ב־`#000000` כרקע ולא ב־`#FFFFFF` כטקסט ישיר במסכים.
- טקסט כהה משתמש ב־off-white רך, לא לבן חד.
- הפרדה בין שכבות נעשית בעזרת הבדלי גוון עדינים (`default`/`paper`/`muted`) ולא ניגוד קיצוני.
- צבעי מותג ראשיים נשארים עקביים בין המצבים, עם התאמות עדינות לניגודיות.

## טוקנים מרכזיים בפועל

### Light (עוגנים מרכזיים)

| קטגוריה | טוקן | ערך |
|---------|------|-----|
| Brand | `--color-brand-primary` | `#4A4540` |
| Accent | `--color-light-pink` | `#F8E4EA` |
| Page BG | `--color-bg-page` | `#F6F1EE` |
| Surface | `--color-bg-surface` | `#FFFFFF` |
| Text | `--color-text-primary` | `#4A4540` |

### Dark (עוגנים מרכזיים - מעודכן)

| קטגוריה | טוקן | ערך |
|---------|------|-----|
| Brand | `--color-brand-primary` | `#4A4540` |
| Accent (Pink) | `--color-brand-secondary` | `#F5DDE4` |
| Page BG | `--color-bg-page` | `#1A1715` |
| Surface | `--color-bg-surface` | `#26211D` |
| Muted Surface | `--color-bg-muted` | `#302924` |
| Text Primary | `--color-text-primary` | `#EEE4DB` |
| Text Secondary | `--color-text-secondary` | `#C5B6A7` |
| Border Soft | `--color-border-soft` | `#3D342D` |

---

## קבצים שנוצרו / עודכנו

| קובץ | תיאור |
|------|-------|
| `src/theme/colors.js` | פלטת צבעים |
| `src/theme/Theme.css` | טוקנים גלובליים + Light/Dark overrides |
| `src/theme/createAppTheme.js` | Theme של MUI (כולל התאמות Dark חומות) |
| `src/theme/ThemeModeProvider.jsx` | ניהול מצב Theme ושמירה ב־localStorage |
| `src/theme/useThemeMode.js` | Hook לשימוש במצב Theme |
| `src/theme/themeModeContext.js` | Context למצב Theme |
| `src/components/Header.jsx` | Header גלובלי |
| `src/components/Header.css` | עיצוב Header |
| `src/components/Footer.jsx` | Footer גלובלי |
| `src/components/Footer.css` | עיצוב Footer |
| `src/components/Layout.jsx` | Layout שעוטף את כל הדפים |
| `src/components/Layout.css` | עיצוב Layout |

---

## חיבור ל-App

### שימוש בסיסי

```jsx
import Layout from './components/Layout';

function App() {
  return (
    <Layout>
      {/* תוכן הדף */}
    </Layout>
  );
}
```

### עם React Router (לעתיד)

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/jobs" element={<Layout><JobsPage /></Layout>} />
        <Route path="/profiles" element={<Layout><ProfilesPage /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}
```

או אם רוצים Layout על כל הדפים:

```jsx
<Routes>
  <Route path="/" element={<Layout />}>
    <Route index element={<HomePage />} />
    <Route path="jobs" element={<JobsPage />} />
  </Route>
</Routes>
```

---

## מבנה Header

- לוגו / שם המערכת
- ניווט: Home, Jobs, Profiles, About, Contact
- Login / Sign Up
- תפריט המבורגר ברספונסיביות (מתחת ל־900px)

---

## מבנה Footer

- תיאור קצר של המערכת
- קישורים מהירים
- פרטי קשר (דוא״ל, טלפון)
- זכויות יוצרים

---

## Theme.css – הנחיות לכל הצוותים

`src/theme/Theme.css` הוא מקור האמת של מערכת העיצוב.

### מה חובה להשתמש

- צבעים דרך משתנים בלבד: `--color-*` (למשל `--color-text-primary`)
- טיפוגרפיה דרך משתנים: `--font-family-*`, `--font-size-*`, `--line-height-*`
- כפתורים משותפים:
  - בסיס: `.btn`
  - ראשי: `.btn--primary`
  - משני: `.btn--secondary`
- עבור Dark Mode: לשמור על גוונים חומים-חמים ושכבת Accent ורודה.

### מה מותר להרחיב

- מותר להוסיף טוקנים חדשים תחת `:root` באותו קובץ בלבד
- מותר להוסיף override ל־`[data-theme='dark']` עבור כל טוקן חדש
- מותר להוסיף מחלקות Utility חדשות אם הן מבוססות על טוקנים קיימים
- מותר להוסיף וריאציות צבע כהות כל עוד הן נשארות באותה משפחה חמה (Brown/Taupe)

### Do / Don't

- Do: להשתמש ב־`var(--token-name)` בכל קומפוננטה משותפת
- Do: למפות רכיבי MUI דרך `createAppTheme.js` לאותם טוקנים
- Do: לשמור Dark Mode אחיד עם כפתורי Brown וה־Pink Accent
- Don't: לכתוב ערכי hex קשיחים בקבצי Header/Footer/Layout משותפים
- Don't: להגדיר font-size/color ישירות כשיש טוקן מתאים
- Don't: להחזיר שחור/כחול כהה כבסיס ל־Dark Mode

### דוגמת שימוש מהירה

```css
.my-team-card-title {
  color: var(--color-text-primary);
  font-family: var(--font-family-heading);
  font-size: var(--font-size-h6);
}
```
