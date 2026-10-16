// 附件在对象存储里的过期参数（单位：天）
export const ATTACHMENT_EXPIRY = {
  expireAfterDays: 3650,
  bucketPrefix: 'member-attachments/',
};

/** 生成给前端的临时访问地址 */
export function uploadUrl(key) {
  return `/uploads/${key}`;
}
