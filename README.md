# Client – צד לקוח

אפליקציית React למערכת השמה לסמינר טכנולוגי.

## טכנולוגיות

- React 19
- Vite 7
- MUI (Material UI)
- Emotion (styling)

## מבנה הפרויקט

```
client/
├── src/
│   ├── components/    # Header, Footer, Layout
│   ├── theme/         # צבעים ו-Theme
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── vite.config.js
```

## הרצה

```bash
cd client
npm install
npm run dev
```

האפליקציה רץ על **http://localhost:5173**

## סקריפטים

| פקודה | תיאור |
|-------|-------|
| `npm run dev`   | שרת פיתוח |
| `npm run build` | Build לפרודקשן |
| `npm run preview` | תצוגה מקדימה של Build |
| `npm run lint`  | בדיקת Lint |

## חיבור ל-Gateway

ב-`vite.config.js` מוגדר Proxy שמפנה בקשות ל-Gateway:

- `/api` → http://localhost:7000/api
- `/gateway` → בדיקת חיבור

ודא שה-Gateway רץ על פורט 7000 לפני שימוש בבקשות API.

## דרישות

- Node.js 18+
- npm
