import express from 'express';
import multer from 'multer';
import { saveMember, updateProfile, listMembers } from './users.js';
import { uploadDir, saveUpload } from './upload.js';
import { logger } from './logger.js';

const app = express();
const upload = multer({ dest: uploadDir, limits: { fileSize: 8 * 1024 * 1024 } });

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
  logger.info('attachment stored', { member: req.params.id, path: saved.path });
  res.status(201).json(saved);
});

const pageSize = 20;
app.get('/api/members', (req, res) => {
  res.json(listMembers({ page: Number(req.query.page) || 1, size: pageSize }));
});

app.listen(3000, () => logger.info('member-hub-api listening on :3000'));
