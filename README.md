# Client – צד לקוח

אפליקציית React למערכת השמה לסמינר טכנולוגי.

## טכנולוגיות

- React 19
- Vite 7
- MUI (Material UI)
- Emotion (styling)

## מבנה הפרויקט

```
seminar-client/
├── src/
│   ├── components/              # Header, Footer, Layout
│   ├── theme/
│   │   ├── Theme.css            # Design tokens (source of truth)
│   │   ├── createAppTheme.js    # MUI theme (light/dark)
│   │   ├── ThemeModeProvider.jsx
│   │   ├── useThemeMode.js
│   │   └── themeModeContext.js
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── vite.config.js
```

## הרצה

```bash
cd seminar-client
npm install
npm run dev
```

האפליקציה רצה על **http://localhost:5173**

## סקריפטים

| פקודה | תיאור |
|-------|-------|
| `npm run dev` | שרת פיתוח |
| `npm run build` | Build לפרודקשן |
| `npm run preview` | תצוגה מקדימה של Build |
| `npm run lint` | בדיקת Lint |

## עקרונות עיצוב מעודכנים

- קיימים שני מצבים: `light` ו־`dark` דרך `ThemeModeProvider`.
- מצב `dark` מבוסס על פלטה חומה-חמה (לא שחור/כחול כהה).
- צבע ורוד נשאר כחלק משפת המותג (accent), גם במצב כהה.
- אין להשתמש ב־`#000000` או `#FFFFFF` ישירות בקומפוננטות.
- שימוש בצבעים דרך טוקנים (`Theme.css`) או דרך `theme.palette` בלבד.
- רכיבי MUI צריכים להישען על ה־theme ולא על hex קשיח.

## חיבור ל-Gateway

ב־`vite.config.js` מוגדר Proxy שמפנה בקשות ל-Gateway:

- `/api` -> `http://localhost:7000/api`
- `/gateway` -> בדיקת חיבור

ודאו שה-Gateway רץ על פורט `7000` לפני שימוש בבקשות API.

## דרישות

- Node.js 18+
- npm
