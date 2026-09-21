import fs from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { cloudDb } from './cloud-db';

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

export function writeVersions(versions: SiteVersion[]): boolean {
  try {
    fs.writeFileSync(VERSIONS_FILE, JSON.stringify(versions, null, 2), 'utf8');
    globalThis.__versions_cache = versions;
    return true;
  } catch (error) {
    console.error('Error writing versions:', error);
    return false;
  }
}

function getNextVersion(currentVersions: SiteVersion[]): string {
  if (!currentVersions || currentVersions.length === 0) {
    return 'v1.0.0';
  }
  
  // Find the highest semantic version
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

  // Increment patch version
  return `v${highestMajor}.${highestMinor}.${highestPatch + 1}`;
}

export function createVersionSnapshot(note: string, author?: string): SiteVersion {
  const versions = readVersions();
  
  // Mark all existing as inactive
  const updatedVersions = versions.map(v => ({ ...v, isActive: false }));
  
  // Read current state
  let siteContent = {};
  try {
    if (fs.existsSync(SITE_CONTENT_FILE)) {
      siteContent = JSON.parse(fs.readFileSync(SITE_CONTENT_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Error reading site content for snapshot:', e);
  }

  // Read messages for all locales
  const messages: Record<string, any> = {};
  try {
    ['fr', 'en', 'ar'].forEach(locale => {
      const msgPath = path.join(process.cwd(), `src/messages/${locale}.json`);
      if (fs.existsSync(msgPath)) {
        messages[locale] = JSON.parse(fs.readFileSync(msgPath, 'utf8'));
      }
    });
  } catch (e) {
    console.error('Error reading messages for snapshot:', e);
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
      // You can add cars/properties count here if needed
    }
  };

  updatedVersions.unshift(newVersion); // Add new version at the beginning
  writeVersions(updatedVersions);

  return newVersion;
}

export function rollbackToVersion(versionId: string): { success: boolean; message: string; version?: SiteVersion } {
  const versions = readVersions();
  
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
      cloudDb.set('site_content', snapshot.siteContent).catch(() => {});
    }

    // Restore messages
    if (snapshot.messages) {
      for (const [locale, content] of Object.entries(snapshot.messages)) {
        try {
          const msgPath = path.join(process.cwd(), `src/messages/${locale}.json`);
          fs.writeFileSync(msgPath, JSON.stringify(content, null, 2), 'utf8');
        } catch {}
        cloudDb.set(`messages_${locale}`, content).catch(() => {});
      }
    }

    // Invalidate all caches and revalidate paths
    cloudDb.invalidate();
    try {
      revalidatePath('/', 'layout');
      for (const loc of ['fr', 'ar', 'en']) {
        revalidatePath(`/${loc}`, 'layout');
        revalidatePath(`/${loc}`, 'page');
      }
    } catch {}

    // Update versions state
    const updatedVersions = versions.map(v => ({
      ...v,
      isActive: v.id === versionId
    }));
    
    writeVersions(updatedVersions);
    
    return { success: true, message: `Restauré à la version ${targetVersion.version}`, version: targetVersion };
  } catch (error) {
    console.error('Error during rollback:', error);
    return { success: false, message: 'Erreur lors de la restauration' };
  }
}

