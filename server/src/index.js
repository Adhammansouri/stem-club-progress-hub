const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 4000;
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads');
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

if (!fs.existsSync(UPLOAD_DIR)) {
	fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Simple CORS: allow all origins for now
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false
}));

app.use(express.json());
app.use('/uploads', express.static(UPLOAD_DIR));

// DB setup
const dbPath = path.join(__dirname, '..', 'data.db');
const db = new Database(dbPath);

db.exec(`
CREATE TABLE IF NOT EXISTS user (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	email TEXT UNIQUE NOT NULL,
	password_hash TEXT NOT NULL,
	name TEXT
);

CREATE TABLE IF NOT EXISTS student (
	id INTEGER PRIMARY KEY CHECK (id = 1),
	name TEXT,
	age INTEGER,
	bio TEXT,
	avatar TEXT,
	github TEXT,
	facebook TEXT,
	linkedin TEXT
);

CREATE TABLE IF NOT EXISTS course (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	title TEXT NOT NULL,
	level INTEGER DEFAULT 0,
	progress INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS project (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	title TEXT NOT NULL,
	description TEXT,
	image TEXT,
	level INTEGER
);
`);

// Add user_id to student/courses/projects for multi-user
(function migrateOwnership() {
	for (const tbl of ['student','course','project','progress_log']) {
		try { db.exec(`ALTER TABLE ${tbl} ADD COLUMN user_id INTEGER`); } catch {}
	}
	// Create profile table to store per-user student info
	try {
		db.exec(`CREATE TABLE IF NOT EXISTS profile (
			user_id INTEGER PRIMARY KEY,
			name TEXT,
			age INTEGER,
			bio TEXT,
			avatar TEXT,
			github TEXT,
			facebook TEXT,
			linkedin TEXT,
			mascot TEXT
		)`);
	} catch {}
	try { db.exec(`ALTER TABLE profile ADD COLUMN mascot TEXT`); } catch {}
	// Achievements table
	try {
		db.exec(`CREATE TABLE IF NOT EXISTS achievement (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER NOT NULL,
			akey TEXT NOT NULL,
			title TEXT NOT NULL,
			icon TEXT,
			earned_at TEXT NOT NULL,
			UNIQUE(user_id, akey)
		)`);
	} catch {}
})();

function awardAchievement(userId, key, title, icon) {
	try {
		const exists = db.prepare('SELECT id FROM achievement WHERE user_id = ? AND akey = ?').get(userId, key);
		if (exists) return false;
		db.prepare('INSERT INTO achievement (user_id, akey, title, icon, earned_at) VALUES (?, ?, ?, ?, ?)')
			.run(userId, key, title, icon || '🏅', new Date().toISOString());
		return true;
	} catch { return false; }
}

// Auth helpers
function auth(req, res, next) {
	const header = req.headers.authorization || '';
	const token = header.startsWith('Bearer ') ? header.slice(7) : null;
	if (!token) return res.status(401).json({ error: 'Unauthorized' });
	try {
		const payload = jwt.verify(token, JWT_SECRET);
		req.userId = payload.uid;
		next();
	} catch {
		return res.status(401).json({ error: 'Unauthorized' });
	}
}

// Auth endpoints
app.post('/api/auth/register', (req, res) => {
	const { email, password, name } = req.body || {};
	if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
	const normEmail = String(email).trim().toLowerCase();
	const hash = bcrypt.hashSync(String(password), 10);
	try {
		const info = db.prepare('INSERT INTO user (email, password_hash, name) VALUES (?, ?, ?)').run(normEmail, hash, name || null);
		const token = jwt.sign({ uid: info.lastInsertRowid }, JWT_SECRET, { expiresIn: '7d' });
		res.json({ token, user: { id: info.lastInsertRowid, email: normEmail, name } });
	} catch (e) {
		return res.status(400).json({ error: 'Email already registered' });
	}
});

app.post('/api/auth/login', (req, res) => {
	const { email, password } = req.body || {};
	const normEmail = String(email || '').trim().toLowerCase();
	const u = db.prepare('SELECT * FROM user WHERE email = ?').get(normEmail);
	if (!u) return res.status(401).json({ error: 'Invalid credentials' });
	if (!bcrypt.compareSync(String(password || ''), u.password_hash)) return res.status(401).json({ error: 'Invalid credentials' });
	const token = jwt.sign({ uid: u.id }, JWT_SECRET, { expiresIn: '7d' });
	res.json({ token, user: { id: u.id, email: u.email, name: u.name } });
});

app.post('/api/auth/seed-demo', (req, res) => {
	const email = 'demo@stem.club';
	const password = '12345678';
	const existing = db.prepare('SELECT * FROM user WHERE email = ?').get(email);
	if (existing) return res.json({ ok: true, email, password });
	const hash = bcrypt.hashSync(password, 10);
	const info = db.prepare('INSERT INTO user (email, password_hash, name) VALUES (?, ?, ?)').run(email, hash, 'Demo User');
	const token = jwt.sign({ uid: info.lastInsertRowid }, JWT_SECRET, { expiresIn: '7d' });
	return res.json({ ok: true, email, password, token });
});

// convenience: allow GET from browser to seed demo user as well
app.get('/api/auth/seed-demo', (req, res) => {
	const email = 'demo@stem.club';
	const password = '12345678';
	const existing = db.prepare('SELECT * FROM user WHERE email = ?').get(email);
	if (existing) return res.json({ ok: true, email, password });
	const hash = bcrypt.hashSync(password, 10);
	const info = db.prepare('INSERT INTO user (email, password_hash, name) VALUES (?, ?, ?)').run(email, hash, 'Demo User');
	const token = jwt.sign({ uid: info.lastInsertRowid }, JWT_SECRET, { expiresIn: '7d' });
	return res.json({ ok: true, email, password, token });
});

// Migrations
(function migrateProjectTable() {
	const columns = db.prepare(`PRAGMA table_info(project)`).all();
	const hasCourseId = columns.some(c => c.name === 'course_id');
	const hasCourseLevel = columns.some(c => c.name === 'course_level');
	const hasSortOrder = columns.some(c => c.name === 'sort_order');
	const hasTags = columns.some(c => c.name === 'tags');
	if (!hasCourseId) {
		try { db.exec(`ALTER TABLE project ADD COLUMN course_id INTEGER`); } catch {}
	}
	if (!hasCourseLevel) {
		try { db.exec(`ALTER TABLE project ADD COLUMN course_level INTEGER`); } catch {}
	}
	if (!hasSortOrder) {
		try { db.exec(`ALTER TABLE project ADD COLUMN sort_order INTEGER`); } catch {}
	}
	if (!hasTags) {
		try { db.exec(`ALTER TABLE project ADD COLUMN tags TEXT`); } catch {}
	}
	// backfill sort_order if null
	try {
		const rows = db.prepare('SELECT id, sort_order FROM project ORDER BY id ASC').all();
		let i = 0;
		const tx = db.transaction((items) => {
			for (const r of items) {
				if (r.sort_order == null) {
					db.prepare('UPDATE project SET sort_order = ? WHERE id = ?').run(i++, r.id);
				}
			}
		});
		tx(rows);
	} catch {}
})();

(function migrateCourseTable() {
	const columns = db.prepare(`PRAGMA table_info(course)`).all();
	const hasTotalLevels = columns.some(c => c.name === 'total_levels');
	const hasLecturesDone = columns.some(c => c.name === 'lectures_done');
	if (!hasTotalLevels) {
		try { db.exec(`ALTER TABLE course ADD COLUMN total_levels INTEGER DEFAULT 6`); } catch {}
	}
	if (!hasLecturesDone) {
		try { db.exec(`ALTER TABLE course ADD COLUMN lectures_done INTEGER DEFAULT 0`); } catch {}
	}
	// Ensure defaults
	try { db.exec(`UPDATE course SET total_levels = COALESCE(total_levels, 6)`); } catch {}
	try { db.exec(`UPDATE course SET lectures_done = COALESCE(lectures_done, 0)`); } catch {}
})();

// progress logs table
(function migrateProgressLog() {
	try {
		db.exec(`CREATE TABLE IF NOT EXISTS progress_log (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			course_id INTEGER,
			date TEXT NOT NULL,
			delta INTEGER NOT NULL
		)`);
	} catch {}
	// Ensure user_id column exists even if the table was created before ownership migration
	try { db.exec(`ALTER TABLE progress_log ADD COLUMN user_id INTEGER`); } catch {}
})();

function computeCourseDerived(totalLevels, lecturesDone) {
	const safeTotal = Math.max(1, Number(totalLevels) || 6);
	const maxLectures = safeTotal * 4;
	const safeLectures = Math.min(Math.max(0, Number(lecturesDone) || 0), maxLectures);
	const level = Math.min(safeTotal, Math.floor(safeLectures / 4) + 1);
	const progress = Math.round((safeLectures / maxLectures) * 100);
	return { level, progress, totalLevels: safeTotal, lecturesDone: safeLectures };
}

// file upload
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, UPLOAD_DIR);
	},
	filename: function (req, file, cb) {
		const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
		const ext = path.extname(file.originalname);
		cb(null, unique + ext);
	}
});
const upload = multer({ storage });

// Student profile routes (scoped)
app.get('/api/student', auth, (req, res) => {
	const row = db.prepare('SELECT * FROM profile WHERE user_id = ?').get(Number(req.userId));
	if (!row) return res.json({});
	res.json(row);
});

app.post('/api/student', auth, upload.single('avatar'), (req, res) => {
	const { name, age, bio, github, facebook, linkedin, mascot } = req.body;
	let avatarPath = null;
	if (req.file) {
		avatarPath = `/uploads/${req.file.filename}`;
	}
	const exists = db.prepare('SELECT user_id, avatar FROM profile WHERE user_id = ?').get(Number(req.userId));
	if (exists) {
		const stmt = db.prepare(`UPDATE profile SET name=?, age=?, bio=?, github=?, facebook=?, linkedin=?, mascot=COALESCE(?, mascot), avatar=COALESCE(?, avatar) WHERE user_id = ?`);
		stmt.run(name || null, age ? Number(age) : null, bio || null, github || null, facebook || null, linkedin || null, mascot || null, avatarPath, Number(req.userId));
		if (avatarPath && exists.avatar && exists.avatar !== avatarPath) {
			const abs = path.join(UPLOAD_DIR, path.basename(exists.avatar));
			if (fs.existsSync(abs)) { try { fs.unlinkSync(abs); } catch {} }
		}
	} else {
		const stmt = db.prepare(`INSERT INTO profile (user_id, name, age, bio, github, facebook, linkedin, avatar, mascot) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
		stmt.run(Number(req.userId), name || null, age ? Number(age) : null, bio || null, github || null, facebook || null, linkedin || null, avatarPath, mascot || null);
	}
	const row = db.prepare('SELECT * FROM profile WHERE user_id = ?').get(Number(req.userId));
	res.json(row);
});

// Courses routes (scoped)
app.get('/api/courses', auth, (req, res) => {
	const rows = db.prepare('SELECT * FROM course WHERE user_id = ? ORDER BY id DESC').all(Number(req.userId));
	res.json(rows);
});

app.get('/api/courses/:id', auth, (req, res) => {
	const { id } = req.params;
	const row = db.prepare('SELECT * FROM course WHERE id = ? AND user_id = ?').get(Number(id), Number(req.userId));
	if (!row) return res.status(404).json({ error: 'Not found' });
	res.json(row);
});

app.post('/api/courses', auth, (req, res) => {
	const { title, total_levels, lectures_done } = req.body;
	const { level, progress, totalLevels, lecturesDone } = computeCourseDerived(total_levels, lectures_done);
	const stmt = db.prepare('INSERT INTO course (title, level, progress, total_levels, lectures_done, user_id) VALUES (?, ?, ?, ?, ?, ?)');
	const info = stmt.run(title, level, progress, totalLevels, lecturesDone, Number(req.userId));
	res.json(db.prepare('SELECT * FROM course WHERE id = ? AND user_id = ?').get(info.lastInsertRowid, Number(req.userId)));
});

app.put('/api/courses/:id', auth, (req, res) => {
	const { id } = req.params;
	const current = db.prepare('SELECT * FROM course WHERE id = ? AND user_id = ?').get(Number(id), Number(req.userId));
	if (!current) return res.status(404).json({ error: 'Not found' });
	const nextTotal = req.body.total_levels != null ? Number(req.body.total_levels) : current.total_levels || 6;
	const nextLectures = req.body.lectures_done != null ? Number(req.body.lectures_done) : current.lectures_done || 0;
	const { level, progress, totalLevels, lecturesDone } = computeCourseDerived(nextTotal, nextLectures);
	const title = req.body.title != null ? req.body.title : current.title;
	const stmt = db.prepare('UPDATE course SET title=?, level=?, progress=?, total_levels=?, lectures_done=? WHERE id = ? AND user_id = ?');
	stmt.run(title, level, progress, totalLevels, lecturesDone, Number(id), Number(req.userId));
	// log progress delta scoped
	const delta = (lecturesDone - (current.lectures_done || 0));
	if (delta !== 0) {
		const today = new Date().toISOString().slice(0,10);
		db.prepare('INSERT INTO progress_log (course_id, date, delta, user_id) VALUES (?, ?, ?, ?)').run(Number(id), today, delta, Number(req.userId));
	}
	// achievements: finishing a level or completing the course
	const prevLevelIndex = Math.floor((current.lectures_done || 0) / 4);
	const newLevelIndex = Math.floor(lecturesDone / 4);
	const awarded = [];
	if (newLevelIndex > prevLevelIndex) {
		for (let li = prevLevelIndex + 1; li <= newLevelIndex; li++) {
			const ok = awardAchievement(Number(req.userId), `course_${id}_level_${li}`, `أنهيت ليفل ${li} في ${title}`, '🎉');
			if (ok) awarded.push({ key: `course_${id}_level_${li}`, title: `أنهيت ليفل ${li} في ${title}`, icon: '🎉' });
		}
	}
	if (progress >= 100) {
		const ok = awardAchievement(Number(req.userId), `course_${id}_complete`, `أنهيت كورس ${title} بالكامل`, '🏆');
		if (ok) awarded.push({ key: `course_${id}_complete`, title: `أنهيت كورس ${title} بالكامل`, icon: '🏆' });
	}
	const updated = db.prepare('SELECT * FROM course WHERE id = ? AND user_id = ?').get(Number(id), Number(req.userId));
	res.json({ course: updated, awarded });
});

app.delete('/api/courses/:id', auth, (req, res) => {
	const { id } = req.params;
	db.prepare('DELETE FROM course WHERE id = ? AND user_id = ?').run(Number(id), Number(req.userId));
	res.json({ success: true });
});

// Projects routes (scoped)
app.get('/api/projects', auth, (req, res) => {
	const rows = db.prepare('SELECT * FROM project WHERE user_id = ? ORDER BY sort_order ASC, id DESC').all(Number(req.userId));
	res.json(rows);
});

function parseTags(input) {
	if (!input) return null;
	try {
		const v = typeof input === 'string' ? JSON.parse(input) : input;
		if (Array.isArray(v)) return JSON.stringify(v.map(x => String(x).trim()).filter(Boolean));
		return null;
	} catch { return null; }
}

app.post('/api/projects', auth, upload.single('image'), (req, res) => {
	const { title, description, level, course_id, course_level, tags } = req.body;
	const image = req.file ? `/uploads/${req.file.filename}` : null;
	const maxRow = db.prepare('SELECT MAX(sort_order) as m FROM project WHERE user_id = ?').get(Number(req.userId));
	const nextOrder = (maxRow && maxRow.m != null) ? (Number(maxRow.m) + 1) : 0;
	const stmt = db.prepare('INSERT INTO project (title, description, image, level, course_id, course_level, sort_order, tags, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
	const info = stmt.run(title, description || null, image, level ? Number(level) : null, course_id ? Number(course_id) : null, course_level ? Number(course_level) : null, nextOrder, parseTags(tags), Number(req.userId));
	res.json(db.prepare('SELECT * FROM project WHERE id = ? AND user_id = ?').get(info.lastInsertRowid, Number(req.userId)));
});

app.put('/api/projects/:id', auth, upload.single('image'), (req, res) => {
	const { id } = req.params;
	const { title, description, level, course_id, course_level, tags } = req.body;
	let newImage = null;
	if (req.file) newImage = `/uploads/${req.file.filename}`;
	const current = db.prepare('SELECT image FROM project WHERE id = ? AND user_id = ?').get(Number(id), Number(req.userId));
	if (!current) return res.status(404).json({ error: 'Not found' });
	const stmt = db.prepare('UPDATE project SET title = COALESCE(?, title), description = COALESCE(?, description), level = COALESCE(?, level), image = COALESCE(?, image), course_id = COALESCE(?, course_id), course_level = COALESCE(?, course_level), tags = COALESCE(?, tags) WHERE id = ? AND user_id = ?');
	stmt.run(title || null, description || null, level != null ? Number(level) : null, newImage, course_id != null && course_id !== '' ? Number(course_id) : null, course_level != null && course_level !== '' ? Number(course_level) : null, parseTags(tags), Number(id), Number(req.userId));
	if (newImage && current.image && current.image !== newImage) {
		const abs = path.join(UPLOAD_DIR, path.basename(current.image));
		if (fs.existsSync(abs)) { try { fs.unlinkSync(abs); } catch {} }
	}
	res.json(db.prepare('SELECT * FROM project WHERE id = ? AND user_id = ?').get(Number(id), Number(req.userId)));
});

app.post('/api/projects/reorder', auth, (req, res) => {
	const { ids } = req.body || {};
	if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids must be array' });
	const tx = db.transaction((arr, uid) => {
		for (let i = 0; i < arr.length; i++) {
			db.prepare('UPDATE project SET sort_order = ? WHERE id = ? AND user_id = ?').run(i, Number(arr[i]), uid);
		}
	});
	tx(ids, Number(req.userId));
	res.json({ success: true });
});

app.delete('/api/projects/:id', auth, (req, res) => {
	const { id } = req.params;
	const current = db.prepare('SELECT image FROM project WHERE id = ? AND user_id = ?').get(Number(id), Number(req.userId));
	if (!current) return res.json({ success: true });
	db.prepare('DELETE FROM project WHERE id = ? AND user_id = ?').run(Number(id), Number(req.userId));
	if (current && current.image) {
		const abs = path.join(UPLOAD_DIR, path.basename(current.image));
		if (fs.existsSync(abs)) { try { fs.unlinkSync(abs); } catch {} }
	}
	res.json({ success: true });
});

// Export and progress (scoped)
app.get('/api/export', auth, (req, res) => {
	const student = db.prepare('SELECT * FROM profile WHERE user_id = ?').get(Number(req.userId)) || {};
	const courses = db.prepare('SELECT * FROM course WHERE user_id = ? ORDER BY id DESC').all(Number(req.userId));
	const projects = db.prepare('SELECT * FROM project WHERE user_id = ? ORDER BY sort_order ASC, id DESC').all(Number(req.userId));
	res.json({ student, courses, projects });
});

// Share token for public portfolio view (valid 30 days)
app.get('/api/portfolio/share-token', auth, (req, res) => {
	try {
		const token = jwt.sign({ uid: Number(req.userId), typ: 'share' }, JWT_SECRET, { expiresIn: '30d' });
		res.json({ token });
	} catch {
		res.status(500).json({ error: 'Failed to generate token' });
	}
});

// Public portfolio (no auth) – requires share token
app.get('/api/public/portfolio', (req, res) => {
	const token = String(req.query.token || '');
	if (!token) return res.status(400).json({ error: 'token required' });
	try {
		const payload = jwt.verify(token, JWT_SECRET);
		if (!payload || payload.typ !== 'share' || !payload.uid) return res.status(401).json({ error: 'invalid token' });
		const uid = Number(payload.uid);
		const student = db.prepare('SELECT * FROM profile WHERE user_id = ?').get(uid) || {};
		const courses = db.prepare('SELECT * FROM course WHERE user_id = ? ORDER BY id DESC').all(uid);
		const projects = db.prepare('SELECT * FROM project WHERE user_id = ? ORDER BY sort_order ASC, id DESC').all(uid);
		res.json({ student, courses, projects });
	} catch {
		return res.status(401).json({ error: 'invalid token' });
	}
});

app.get('/api/progress', auth, (req, res) => {
	const rows = db.prepare('SELECT * FROM progress_log WHERE user_id = ? ORDER BY date ASC, id ASC').all(Number(req.userId));
	res.json(rows);
});

app.post('/api/migrate/claim-legacy', auth, (req, res) => {
	let claimedProfile = false;
	try {
		const legacy = db.prepare('SELECT * FROM student WHERE id = 1').get();
		const exists = db.prepare('SELECT user_id FROM profile WHERE user_id = ?').get(Number(req.userId));
		if (legacy && !exists) {
			db.prepare('INSERT OR REPLACE INTO profile (user_id, name, age, bio, avatar, github, facebook, linkedin) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
				.run(Number(req.userId), legacy.name || null, legacy.age || null, legacy.bio || null, legacy.avatar || null, legacy.github || null, legacy.facebook || null, legacy.linkedin || null);
			claimedProfile = true;
		}
	} catch {}
	const updCourses = db.prepare('UPDATE course SET user_id = ? WHERE user_id IS NULL').run(Number(req.userId));
	const updProjects = db.prepare('UPDATE project SET user_id = ? WHERE user_id IS NULL').run(Number(req.userId));
	const updLogs = db.prepare('UPDATE progress_log SET user_id = ? WHERE user_id IS NULL').run(Number(req.userId));
	res.json({ ok: true, claimedProfile, updated: { courses: updCourses.changes || 0, projects: updProjects.changes || 0, progress: updLogs.changes || 0 } });
});

// Achievements endpoints
app.get('/api/achievements', auth, (req, res) => {
	const rows = db.prepare('SELECT * FROM achievement WHERE user_id = ? ORDER BY earned_at DESC, id DESC').all(Number(req.userId));
	res.json(rows);
});

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
}); 