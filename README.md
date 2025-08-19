# STEM Club Portfolio

منصة بورتفوليو تفاعلية للطلاب (12–19 سنة) لعرض المشاريع وتتبع التقدم في الكورسات، مع صفحات تسجيل/دخول احترافية، إنجازات، ورسوُم بيانية.

## تشغيل محلي

1) Backend
```
cd server
npm i
# ضع .env (مثال)
echo PORT=4000> .env
echo UPLOAD_DIR=uploads>> .env
echo JWT_SECRET=dev-secret>> .env
npm run dev
```

2) Frontend
```
cd client
npm i
npm run dev
```

- الواجهة: http://localhost:5173
- الخادم: http://localhost:4000

## خصائص سريعة
- بروفايل وصورة شخصية وروابط سوشيال
- كورسات مع مستويات ومحاضرات، وتقدم محسوب تلقائيًا
- مشاريع بصور، وسوم، وترتيب بالسحب والإفلات
- إنجازات تلقائية عند إنهاء ليفل/كورس
- رسوم بيانية (تقدّم أسبوعي، توزيع التقدم) وتقويم Heatmap
- تسجيل/دخول JWT، صفحات Auth تفاعلية (Tilt+Confetti+Typewriter)

## رفع إلى GitHub
```
# من جذر المشروع
git init
git add .
git commit -m "Initial commit: STEM Club portfolio"
# أنشئ مستودعًا جديدًا ثم:
# استبدل USER و REPO
git remote add origin https://github.com/USER/REPO.git
git branch -M main
git push -u origin main
```

أو باستخدام gh CLI:
```
# من الجذر
gh repo create REPO --public --source . --remote origin --push
```

تأكد من أن `.gitignore` يتجاهل `server/.env` و`server/data.db` و`uploads`. 