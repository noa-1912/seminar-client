# תשתית Layout – השמה לסמינר טכנולוגי

## פלטת צבעים (Hex)

| שם           | Hex       |
|--------------|-----------|
| White        | `#FFFFFF` |
| Light Pink   | `#F8E4EA` |
| Light Pink Alt | `#F5DDE4` |
| Warm Beige   | `#F5F0E8` |
| Warm Beige Alt | `#EDE8E1` |
| Soft Gray    | `#E8E4E0` |
| Gray Light   | `#B8B4AE` |
| Gray Medium  | `#9A9590` |
| Gray Dark    | `#6B6660` |
| Text Primary | `#4A4540` |
| Text Secondary | `#6B6660` |

---

## קבצים שנוצרו / עודכנו

| קובץ | תיאור |
|------|-------|
| `src/theme/colors.js` | פלטת צבעים |
| `src/theme/index.js` | Theme של MUI |
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
