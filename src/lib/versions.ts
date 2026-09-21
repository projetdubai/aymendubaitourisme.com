import fs from 'fs';
import path from 'path';
import { cloudDb } from './cloud-db';
import { revalidateSite } from './revalidate';

export interface SiteVersion {
  id: string;
  version: string;
  createdAt: string;
  author: string;
  note: string;
  isActive: boolean;
  snapshot: any;
}

const VERSIONS_FILE = path.join(process.cwd(), 'src/data/versions.json');
const SITE_CONTENT_FILE = path.join(process.cwd(), 'src/data/site-content.json');

declare global {
  var __versions_cache: SiteVersion[] | undefined;
}

export function readVersions(): SiteVersion[] {
  if (globalThis.__versions_cache) {
    return globalThis.__versions_cache;
  }
  try {
    if (!fs.existsSync(VERSIONS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(VERSIONS_FILE, 'utf8');
    const versions = JSON.parse(data);
    globalThis.__versions_cache = versions;
    return versions;
  } catch (error) {
    console.error('Error reading versions:', error);
    return [];
  }
}

export async function readVersionsAsync(): Promise<SiteVersion[]> {
  try {
    const cloudVersions = await cloudDb.get<SiteVersion[]>('versions');
    if (Array.isArray(cloudVersions) && cloudVersions.length > 0) {
      globalThis.__versions_cache = cloudVersions;
      return cloudVersions;
    }
  } catch {}
  return readVersions();
}

export async function writeVersionsAsync(versions: SiteVersion[]): Promise<boolean> {
  globalThis.__versions_cache = versions;
  try {
    fs.writeFileSync(VERSIONS_FILE, JSON.stringify(versions, null, 2), 'utf8');
  } catch {}
  await cloudDb.set('versions', versions);
  return true;
}

export function writeVersions(versions: SiteVersion[]): boolean {
  writeVersionsAsync(versions).catch(() => {});
  return true;
}

function getNextVersion(currentVersions: SiteVersion[]): string {
  if (!currentVersions || currentVersions.length === 0) {
    return 'v1.0.0';
  }
  
  let highestMajor = 1;
  let highestMinor = 0;
  let highestPatch = 0;

  for (const v of currentVersions) {
    const match = v.version.match(/^v(\d+)\.(\d+)\.(\d+)$/);
    if (match) {
      const major = parseInt(match[1]);
      const minor = parseInt(match[2]);
      const patch = parseInt(match[3]);
      
      if (major > highestMajor || 
         (major === highestMajor && minor > highestMinor) ||
         (major === highestMajor && minor === highestMinor && patch > highestPatch)) {
        highestMajor = major;
        highestMinor = minor;
        highestPatch = patch;
      }
    }
  }

  return `v${highestMajor}.${highestMinor}.${highestPatch + 1}`;
}

export async function createVersionSnapshotAsync(note: string, author?: string): Promise<SiteVersion> {
  const versions = await readVersionsAsync();
  
  const updatedVersions = versions.map(v => ({ ...v, isActive: false }));
  
  // Read current state from cloudDb
  let siteContent = (await cloudDb.get('site_content')) || {};
  if (Object.keys(siteContent).length === 0) {
    try {
      if (fs.existsSync(SITE_CONTENT_FILE)) {
        siteContent = JSON.parse(fs.readFileSync(SITE_CONTENT_FILE, 'utf8'));
      }
    } catch {}
  }

  // Read messages for all locales
  const messages: Record<string, any> = {};
  for (const locale of ['fr', 'en', 'ar']) {
    let locMsgs = await cloudDb.get(`messages_${locale}`);
    if (!locMsgs) {
      try {
        const msgPath = path.join(process.cwd(), `src/messages/${locale}.json`);
        if (fs.existsSync(msgPath)) {
          locMsgs = JSON.parse(fs.readFileSync(msgPath, 'utf8'));
        }
      } catch {}
    }
    messages[locale] = locMsgs || {};
  }

  const nextVersionNum = getNextVersion(versions);
  const newVersion: SiteVersion = {
    id: `ver_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    version: nextVersionNum,
    createdAt: new Date().toISOString(),
    author: author || 'System',
    note: note,
    isActive: true,
    snapshot: {
      siteContent,
      messages,
    }
  };

  updatedVersions.unshift(newVersion);
  await writeVersionsAsync(updatedVersions);

  return newVersion;
}

export function createVersionSnapshot(note: string, author?: string): SiteVersion {
  const versions = readVersions();
  const nextVersionNum = getNextVersion(versions);
  const newVersion: SiteVersion = {
    id: `ver_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    version: nextVersionNum,
    createdAt: new Date().toISOString(),
    author: author || 'System',
    note: note,
    isActive: true,
    snapshot: {}
  };
  createVersionSnapshotAsync(note, author).catch(() => {});
  return newVersion;
}

export async function rollbackToVersion(versionId: string): Promise<{ success: boolean; message: string; version?: SiteVersion }> {
  const versions = await readVersionsAsync();
  
  const targetVersionIndex = versions.findIndex(v => v.id === versionId);
  if (targetVersionIndex === -1) {
    return { success: false, message: 'Version non trouvée' };
  }

  const targetVersion = versions[targetVersionIndex];
  const snapshot = targetVersion.snapshot;

  if (!snapshot) {
    return { success: false, message: 'Données de snapshot manquantes pour cette version' };
  }

  try {
    // Restore site-content
    if (snapshot.siteContent) {
      try {
        fs.writeFileSync(SITE_CONTENT_FILE, JSON.stringify(snapshot.siteContent, null, 2), 'utf8');
      } catch {}
      await cloudDb.set('site_content', snapshot.siteContent);
    }

    // Restore messages
    if (snapshot.messages) {
      for (const [locale, content] of Object.entries(snapshot.messages)) {
        try {
          const msgPath = path.join(process.cwd(), `src/messages/${locale}.json`);
          fs.writeFileSync(msgPath, JSON.stringify(content, null, 2), 'utf8');
        } catch {}
        await cloudDb.set(`messages_${locale}`, content);
      }
    }

    // Invalidate all caches and revalidate paths in < 1 second
    await revalidateSite();

    // Update versions state
    const updatedVersions = versions.map(v => ({
      ...v,
      isActive: v.id === versionId
    }));
    
    await writeVersionsAsync(updatedVersions);
    
    return { success: true, message: `Restauré à la version ${targetVersion.version}`, version: targetVersion };
  } catch (error) {
    console.error('Error during rollback:', error);
    return { success: false, message: 'Erreur lors de la restauration' };
  }
}
