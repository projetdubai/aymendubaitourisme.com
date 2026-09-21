import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import fs from "fs";
import path from "path";

// Deployment state cache
declare global {
  var __last_deployment: {
    status: "idle" | "building" | "success" | "error";
    timestamp: string | null;
    output: string | null;
    url: string | null;
    error: string | null;
  } | undefined;
}

if (!globalThis.__last_deployment) {
  globalThis.__last_deployment = {
    status: "idle",
    timestamp: null,
    output: null,
    url: "https://www.aymendubaitourisme.com",
    error: null,
  };
}

const CONTENT_FILE = path.join(process.cwd(), "src", "data", "site-content.json");

function getDeployHookUrl(): string | null {
  if (process.env.VERCEL_DEPLOY_HOOK_URL) {
    return process.env.VERCEL_DEPLOY_HOOK_URL;
  }
  try {
    if (fs.existsSync(CONTENT_FILE)) {
      const data = JSON.parse(fs.readFileSync(CONTENT_FILE, "utf-8"));
      return data?.general?.deployHookUrl || null;
    }
  } catch {}
  return null;
}

function saveDeployHookUrl(url: string) {
  try {
    if (fs.existsSync(CONTENT_FILE)) {
      const data = JSON.parse(fs.readFileSync(CONTENT_FILE, "utf-8"));
      if (!data.general) data.general = {};
      data.general.deployHookUrl = url;
      fs.writeFileSync(CONTENT_FILE, JSON.stringify(data, null, 2), "utf-8");
    }
  } catch (e) {
    console.warn("Could not save deploy hook URL:", e);
  }
}

export async function GET() {
  const hookUrl = getDeployHookUrl();
  return NextResponse.json({
    success: true,
    state: globalThis.__last_deployment,
    deployHookConfigured: Boolean(hookUrl),
    deployHookUrl: hookUrl,
    officialUrl: "https://www.aymendubaitourisme.com",
  });
}

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {}

    if (body.deployHookUrl) {
      saveDeployHookUrl(body.deployHookUrl);
    }

    const hookUrl = body.deployHookUrl || getDeployHookUrl();

    // Strategy 1: If Vercel Deploy Hook URL is provided, trigger it via HTTP POST
    if (hookUrl && hookUrl.startsWith("http")) {
      globalThis.__last_deployment = {
        status: "building",
        timestamp: new Date().toISOString(),
        output: "Déclenchement du Vercel Deploy Hook...",
        url: "https://www.aymendubaitourisme.com",
        error: null,
      };

      try {
        const hookRes = await fetch(hookUrl, { method: "POST" });
        if (hookRes.ok || hookRes.status === 201) {
          globalThis.__last_deployment = {
            status: "success",
            timestamp: new Date().toISOString(),
            output: `Vercel Deploy Hook déclenché avec succès ! (Code HTTP ${hookRes.status})\nLe déploiement de production a démarré sur Vercel.`,
            url: "https://www.aymendubaitourisme.com",
            error: null,
          };
          return NextResponse.json({
            success: true,
            method: "hook",
            message: "Déploiement Vercel lancé avec succès !",
            url: "https://www.aymendubaitourisme.com",
            state: globalThis.__last_deployment,
          });
        } else {
          const errText = await hookRes.text();
          throw new Error(`Le Deploy Hook Vercel a retourné le code ${hookRes.status}: ${errText}`);
        }
      } catch (hookErr: any) {
        console.warn("Deploy hook failed, attempting CLI fallback:", hookErr);
        // Fallback to CLI
      }
    }

    // Strategy 2: Execute `npx vercel --prod --yes` directly
    globalThis.__last_deployment = {
      status: "building",
      timestamp: new Date().toISOString(),
      output: "Exécution de la commande : npx vercel --prod --yes...",
      url: "https://www.aymendubaitourisme.com",
      error: null,
    };

    return new Promise<NextResponse>((resolve) => {
      // 180 seconds timeout for full build & upload
      exec(
        "npx vercel --prod --yes",
        {
          cwd: process.cwd(),
          timeout: 180000,
          env: { ...process.env, CI: "1" },
        },
        (error, stdout, stderr) => {
          const combinedOutput = `${stdout}\n${stderr}`.trim();

          if (error) {
            console.error("Vercel CLI deploy error:", error);
            globalThis.__last_deployment = {
              status: "error",
              timestamp: new Date().toISOString(),
              output: combinedOutput,
              url: null,
              error: error.message,
            };

            resolve(
              NextResponse.json(
                {
                  success: false,
                  method: "cli",
                  error: error.message,
                  output: combinedOutput,
                  message:
                    "Le déploiement CLI a rencontré une erreur ou attend une authentification.",
                  guidance:
                    "Astuce : vous pouvez exécuter 'npx vercel --prod' directement dans votre terminal ou configurer un Vercel Deploy Hook.",
                  state: globalThis.__last_deployment,
                },
                { status: 500 }
              )
            );
            return;
          }

          // Extract deployed URL from stdout
          const urlMatch = combinedOutput.match(/https:\/\/[a-zA-Z0-9-_\.]+\.vercel\.app/i);
          const deployedUrl = urlMatch ? urlMatch[0] : "https://www.aymendubaitourisme.com";

          globalThis.__last_deployment = {
            status: "success",
            timestamp: new Date().toISOString(),
            output: combinedOutput,
            url: deployedUrl,
            error: null,
          };

          resolve(
            NextResponse.json({
              success: true,
              method: "cli",
              message: "Site web déployé avec succès sur Vercel Production !",
              url: deployedUrl,
              output: combinedOutput,
              state: globalThis.__last_deployment,
            })
          );
        }
      );
    });
  } catch (err: any) {
    globalThis.__last_deployment = {
      status: "error",
      timestamp: new Date().toISOString(),
      output: null,
      url: null,
      error: err.message,
    };

    return NextResponse.json(
      {
        success: false,
        error: err.message || "Erreur interne lors du déploiement",
        state: globalThis.__last_deployment,
      },
      { status: 500 }
    );
  }
}
