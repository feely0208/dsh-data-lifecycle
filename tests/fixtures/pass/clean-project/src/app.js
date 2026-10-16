import express from 'express';
import multer from 'multer';
import { saveMember, updateProfile, listMembers } from './users.js';
import { saveUpload } from './upload.js';
import { logger } from './logger.js';

const app = express();
const upload = multer({ dest: 'uploads', limits: { fileSize: 8 * 1024 * 1024 } });

app.use(express.json());

app.post('/api/members', (req, res) => {
  const member = saveMember(req.body);
  logger.info('member created', { id: member.id, phone: member.phone });
  res.status(201).json(member);
});

app.put('/api/members/:id', (req, res) => {
  res.json(updateProfile(req.params.id, req.body));
});

app.post('/api/members/:id/attachments', upload.single('file'), async (req, res) => {
  const saved = await saveUpload(req.params.id, req.file, req.body);
  res.status(201).json(saved);
});

app.get('/api/members', (req, res) => {
  res.json(listMembers({ page: Number(req.query.page) || 1, size: 20 }));
});

app.listen(3000, () => logger.info('member-hub-api listening on :3000'));
